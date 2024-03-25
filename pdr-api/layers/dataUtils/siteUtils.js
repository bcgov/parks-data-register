const { Exception } = require('/opt/base');
const { logger } = require('/opt/base');
const { TABLE_NAME, runQuery, getOne } = require('/opt/dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const MINOR_UPDATE_TYPE = 'minor';
const MAJOR_UPDATE_TYPE = 'major';
const REPEAL_UPDATE_TYPE = 'repeal';
const UPDATE_TYPES = [
  MAJOR_UPDATE_TYPE,
  MINOR_UPDATE_TYPE,
  REPEAL_UPDATE_TYPE
];

const ESTABLISHED_STATE = 'established';
const HISTORICAL_STATE = 'historical';
const REPEALED_STATE = 'repealed';

const MANDATORY_PUT_FIELDS = [
  'effectiveDate',
  'lastVersionDate'
];

const OPTIONAL_PUT_FIELDS = [
  'audioClip',
  'displayName',
  'legalName',
  'notes',
  'phoneticName',
  'searchTerms'
];

/**
 * Asynchronously retrieves all sites for a given protected area.
 *
 * @async
 * @function getSitesForProtectedArea
 * @param {string} identifier - The identifier of the Protected Area.
 * @returns {Promise} - A Promise that resolves when the sites have been retrieved.
 *
 * @example
 * await getSitesForProtectedArea('123');
 */
async function getSitesForProtectedArea(identifier) {
  const query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: identifier },
      ':sk': { S: 'Site::' }
    }
  };
  logger.info('Get list of sites for a protected area');
  const res = await runQuery(query);
  logger.debug(res);
  return res;
}

/**
 * Validates a PUT request for updating site details.
 * @async
 * @param {string} identifier - The identifier of the site.
 * @param {Object} body - The body of the PUT request containing the updated site details.
 * @param {string} updateType - The type of update: 'minor', 'major', or 'repeal'.
 * @returns {Promise<boolean>} - A promise that resolves to true if the validation passes.
 * @throws {Exception} Throws an exception if the validation fails.
 */
async function validatePutRequest(identifier, body, updateType) {
  try {
    if (!body || !Object.keys(body)?.length) {
      throw new Exception('Empty request body.', {
        code: 400,
        error: 'Request body cannot be empty.'
      });
    }

    // Check if site exists
    const site = await getOne(identifier, 'Details');
    if (!Object.keys(site).length) {
      // Throw if site not found
      throw new Exception(`Site not found.`, {
        code: 400,
        error: `No site for ${identifier} found.`
      }
      );
    };

    // Check if trying to perform major update on repealed site
    if (site.status === REPEALED_STATE) {
      if (updateType === MAJOR_UPDATE_TYPE || updateType === REPEAL_UPDATE_TYPE) {
        // Cannot perform major update on repealed site
        throw new Exception('Forbidden update action.', {
          code: 400,
          error: 'Cannot perform a major update or repeal on an already-repealed site.'
        });
      }
    }

    // Check updateType
    let checkFields = [...MANDATORY_PUT_FIELDS];
    switch (updateType) {
      case MINOR_UPDATE_TYPE:
        break;
      case MAJOR_UPDATE_TYPE:
        checkFields.push('legalName');
        break;
      case REPEAL_UPDATE_TYPE:
        for (const field of Object.keys(body)) {
          if (field !== 'notes' && checkFields.indexOf(field) === -1) {
            delete body[field];
          }
        }
        break;
      default:
        throw new Exception(`'${updateType}' is not a valid update type.`, {
          code: 400,
          error: `A valid update type (${UPDATE_TYPES.join(', ')}) was not provided.`
        });
    }

    // Check if mandatory fields were provided
    for (const field of checkFields) {
      if (!body.hasOwnProperty(field) || !body[field]) {
        throw new Exception('Missing mandatory fields.', {
          code: 400,
          error: `For updateType '${updateType}', the following fields must be provided in the request body: ${checkFields.join(', ')}.`
        });
      }
    }

    // If major update, check that the new legalName is different than the current.
    if (updateType === MAJOR_UPDATE_TYPE && body?.legalName === site.legalName) {
      // New legalName is not different
      throw new Exception('Invalid mandatory field.', {
        code: 400,
        error: `Legal name changes must have a different legalName than the current established name (current legalName: ${site.legalName})`
      });
    }

    // Body & updateType are valid, site exists.
    return true;
  } catch (error) {
    logger.error('Site PUT request failed validation.');
    throw error;
  }
}

/**
 * Creates a transaction to update site details.
 * @async
 * @function createSitePutTransaction
 * @param {string} identifier - The identifier of the site.
 * @param {Object} body - The body of the PUT request containing the updated site details.
 * @param {string} updateType - The type of update: 'minor', 'major', or 'repeal'.
 * @param {string} user - The user performing the update.
 * @param {string} [currentTimeISO=null] - The current time in ISO format. Defaults to null.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of put transactions.
 * @throws {Exception} Throws an exception if the transaction creation fails.
 */
const createSitePutTransaction = async function (identifier, body, updateType, user, currentTimeISO = null) {
  try {
    // Validate request
    await validatePutRequest(identifier, body, updateType);

    // 1. Update the existing main site object
    // Get existing site object (pk: <pAreaId>::Site::<siteId>, sk: Details)
    const site = await getOne(identifier, 'Details');

    // Determine next status
    let newStatus = site.status;
    if (updateType === REPEAL_UPDATE_TYPE) {
      newStatus = REPEALED_STATE;
    }

    // Build update transaction for main site object
    let updatedAttributeValues = {
      ':updateDate': { S: currentTimeISO },
      ':lastModifiedBy': { S: user },
      ':status': { S: newStatus },
      ':lastVersionDate': { S: body.lastVersionDate },
      ':effectiveDate': { S: body.effectiveDate }
    };
    let updateExpression = ['SET updateDate = :updateDate, #status = :status, lastModifiedBy = :lastModifiedBy, effectiveDate = :effectiveDate'];

    // Add optional fields to update
    if (updateType !== REPEAL_UPDATE_TYPE) {
      for (const field of OPTIONAL_PUT_FIELDS) {
        if (body.hasOwnProperty(field)) {
          updatedAttributeValues[`:${field}`] = { S: body[field] || '' };
          updateExpression.push(`${field} = :${field}`);
        }
      }
    }

    // Build update transaction for site object
    let siteUpdate = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: identifier },
        sk: { S: 'Details' }
      },
      ExpressionAttributeValues: updatedAttributeValues,
      ExpressionAttributeNames: { '#status': 'status' },
      UpdateExpression: updateExpression.join(', '),
      ConditionExpression: 'updateDate = :lastVersionDate',
    };

    // If major change (not repealed), deny if legalName is the same
    if (updateType === MAJOR_UPDATE_TYPE) {
      siteUpdate.ExpressionAttributeValues[':oldLegalName'] = { S: body.legalName };
      siteUpdate.ConditionExpression += ' AND legalName <> :oldLegalName';
    }

    // Add to transaction list
    let putTransactions = [{ action: 'Update', data: siteUpdate }];

    logger.debug('Site record update parameters:', siteUpdate);

    // 2. Update the protected area site object (pk: <pAreaId>, sk: Site::<siteId>)
    // Only update if the displayName property is changing
    if (body?.displayName) {
      const paSitePut = createPASiteUpdate(identifier, body.displayName);
      putTransactions.push({ action: 'Update', data: paSitePut });
    }

    // 3. Create changelog item
    // Only create a changelog item if doing a major change or repeal
    if (updateType === MAJOR_UPDATE_TYPE || updateType === REPEAL_UPDATE_TYPE) {
      putTransactions.push(await createChangeLogPut(identifier, body, user, currentTimeISO, newStatus));
    }

    // Return an array of put actions
    return putTransactions;

  } catch (error) {
    logger.error('Failed to create site update transaction');
    throw error;
  }
};

/**
 * Creates a transaction to update the display name of a protected area site.
 * @function createPASiteUpdate
 * @param {string} identifier - The identifier of the site.
 * @param {string} displayName - The new display name for the site.
 * @returns {Object} - The update transaction for the protected area site object.
 * @throws {Exception} Throws an exception if the transaction creation fails.
 */
const createPASiteUpdate = function (identifier, displayName) {
  try {

    // Build update transaction for protected area site object
    const paSiteUpdate = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: identifier.split('::')[0] },
        sk: { S: `Site::${identifier.split('::')[2]}` }
      },
      UpdateExpression: 'SET displayName = :displayName',
      ExpressionAttributeValues: {
        ':displayName': { S: displayName }
      },
      ConditionExpression: 'attribute_exists(pk)'
    };

    logger.debug('Protected area site record update parameters:', JSON.stringify(paSiteUpdate));

    return paSiteUpdate;
  } catch (error) {
    logger.error('Error creating protected area site PUT');
    throw error;
  }
};

/**
 * Creates a transaction to put a changelog item for site updates.
 * @async
 * @function createChangeLogPut
 * @param {string} identifier - The identifier of the site.
 * @param {Object} body - The body of the PUT request containing the updated site details.
 * @param {string} user - The user performing the update.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @param {string} newStatus - The new status of the site.
 * @returns {Promise<Object>} - A promise that resolves to the changelog put object.
 * @throws {Exception} Throws an exception if the transaction creation fails.
 */
const createChangeLogPut = async function (identifier, body, user, currentTimeISO, newStatus) {
  // Get the existing record
  try {
    const oldSite = await getOne(identifier, 'Details');

    // Fields that will overwrite
    const fields = {
      sk: currentTimeISO,
      updateDate: currentTimeISO,
      lastModifiedBy: user,
      newLegalName: body?.legalName || oldSite.legalName,
      newEffectiveDate: body?.effectiveDate,
      newStatus: newStatus,
      status: HISTORICAL_STATE,
      legalNameChanged: body?.legalName && body?.legalName !== oldSite.legalName,
      statusChanged: newStatus !== oldSite.status
    };

    // Create changelog put object
    let changelogItem = { ...oldSite, ...fields };
    const changelogPut = {
      TableName: TABLE_NAME,
      Item: marshall(changelogItem, {
        removeUndefinedValues: true
      })
    };

    logger.debug('Site changelog record update parameters:', changelogPut);

    return changelogPut;
  } catch (error) {
    logger.error('Error creating site changelog item PUT');
    throw error;
  }
};

module.exports = {
  ESTABLISHED_STATE,
  HISTORICAL_STATE,
  MINOR_UPDATE_TYPE,
  MAJOR_UPDATE_TYPE,
  REPEALED_STATE,
  REPEAL_UPDATE_TYPE,
  createChangeLogPut,
  createPASiteUpdate,
  createSitePutTransaction,
  getSitesForProtectedArea,
  validatePutRequest,
};