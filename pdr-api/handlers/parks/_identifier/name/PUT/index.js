const AWS = require("aws-sdk");
const { TABLE_NAME, dynamodb, getOne, ESTABLISHED_STATE, HISTORICAL_STATE, REPEALED_STATE } = require('/opt/dynamodb');
const { DateTime } = require('luxon');
const { sendResponse, logger } = require('/opt/base');
const TIMEZONE = 'America/Vancouver';

const mandatoryFields = [
  'effectiveDate',
  'lastVersionDate'
];

const optionalFields = [
  'legalName',
  'displayName',
  'phoneticName',
  'searchTerms',
  'notes',
  'audioClip'
]

/**
 * AWS Lambda function for updating park name details.
 *
 * @param {Object} event - AWS Lambda event object.
 * @param {Object} context - AWS Lambda context object.
 * @returns {Promise<Object>} - A Promise that resolves to the response object.
 */
exports.handler = async (event, context) => {
  /**
   * Logs the update park name details event.
   *
   * @param {string} message - The log message.
   * @returns {void}
   */
  logger.info('Update park name details');
  logger.debug(event);
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Extracts the 'updateType' parameter from the query string.
    const updateType = event?.queryStringParameters?.updateType;
    const identifier = event.pathParameters.identifier;

    // Parses the request body as JSON.
    let body = JSON.parse(event.body);

    // Gets the current date and time in the Pacific Time Zone.
    const currentPSTDateTime = DateTime.now().setZone(TIMEZONE);

    // Converts the current date and time to UTC and then to ISO format.
    const currentTimeISO = currentPSTDateTime.toUTC().toISO();

    // Extracts 'isAdmin' from the request context authorizer.
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);
    const user = event.requestContext?.authorizer?.userID;

    // Ensures all required fields are present in the payload.
    let checkFields = [ ...mandatoryFields ];
    if (updateType === 'major') {
      checkFields.push('legalName');
    }
    try {
      validateRequest(body, checkFields, updateType);
    } catch (error) {
      return sendResponse(400, [], 'Invalid payload.', error);
    }

    if (!isAdmin) {
      return sendResponse(403, [], 'Unauthorized', 'Unauthorized');
    }

    // Retrieves the current record based on the identifier.
    const currentRecord = await getOne(identifier, 'Details');

    // If no currentRecord exists, we shouldn't perform any actions.
    if (!currentRecord?.pk) {
      throw `Protected area with identifier '${identifier}' not found.`
    }

    // Checks the type of update and calls the corresponding function.
    if (updateType === 'minor') {
      // Don't trigger a legal name change
      logger.info('Minor change');
      return await minorUpdate(identifier, user, body, currentTimeISO, currentRecord, updateType);
    } else if (updateType === 'major') {
      // Legal Name Change update
      logger.info('Major change');
      return await majorChange(identifier, user, body, currentTimeISO, currentRecord, ESTABLISHED_STATE, updateType);
    } else if (updateType === 'repeal') {
      // Repeal protected area
      logger.info('Repeal change');
      return await majorChange(identifier, user, body, currentTimeISO, currentRecord, REPEALED_STATE, updateType);
    } else {
      // Returns an error response for an invalid updateType.
      return sendResponse(400, [], 'Error invalid updateType', 'Error', context);
    }
  } catch (err) {
    // Logs any caught errors.
    logger.error(err);

    // Returns an error response with appropriate status code and message.
    return sendResponse(400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

/**
 * Validates the request body.
 *
 * @param {Object} body - The request body.
 * @param {String} updateType - The type of update to be performed.
 * @throws {Error} Throws an error if the payload is invalid.
 * @returns {void}
 */
function validateRequest(body, checkFields, updateType) {
  // If repealing, trim all optional fields
  for (const field of Object.keys(body))
    if (updateType === 'repeal' && checkFields.indexOf(field) === -1) {
      delete body[field];
    }
  // Check if mandatory fields were provided.
  for (const field of checkFields) {
    if (!body.hasOwnProperty(field) || !body[field]) {
      throw `For updateType '${updateType}', the following fields must be provided: ${checkFields.join(', ')}`;
    }
  }
  // Check if indexable fields are non-null (we must provide a truthy value to indexable fields!)
  if (body.hasOwnProperty('legalName') && !body?.legalName) {
    // cannot have empty legal name field.
    throw `Field 'legalName' cannot be empty.`;
  }
  if (body.hasOwnProperty('displayName') && !body?.displayName) {
    // cannot have empty display name field.
    if (body?.legalName) {
      // Designs call for allowable empty displayName field. Since this field is indexable, we must copy in the legalName value (if provided).
      body.displayName = body.legalName;
    } else {
      // If no legalName provided, delete the field.
      delete body.displayName;
    }
  }
  return true;
}

/**
 * Handles a minor update.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<Object>} - A Promise that resolves to the response object.
 */
async function minorUpdate(identifier, user, body, currentTimeISO, currentRecord, updateType) {
  let attributes;
  if (currentRecord.status === REPEALED_STATE) {
    // Calls the 'updateRecord' function to update the repealed record.
    attributes = await updateRecord(identifier, user, body, currentTimeISO, REPEALED_STATE, updateType, null, true);
  } else {
    // Calls the 'updateRecord' function to update the record.
    attributes = await updateRecord(identifier, user, body, currentTimeISO, ESTABLISHED_STATE, updateType);
  }

  // Returns a success response with the updated attributes.
  return sendResponse(200, attributes, 'Record updated');
}

/**
 * Handles a legal name change or a repeal.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<Object>} - A Promise that resolves to the response object.
 */
async function majorChange(identifier, user, body, currentTimeISO, currentRecord, newStatus, updateType) {
  // Cannot do a major change if not the correct status
  if (currentRecord.status !== ESTABLISHED_STATE) {
    return sendResponse(400, [], 'Protected area record cannot be edited.', `Cannot perform major update for records with status ${currentRecord.status}.`);
  }
  // Creates a changelog item for the legal name change.
  const putTransaction = await createChangeLogItem(body, user, currentTimeISO, currentRecord, newStatus);

  // Calls the 'updateRecord' function to update the record.
  const attributes = await updateRecord(identifier, user, body, currentTimeISO, newStatus, updateType, putTransaction);

  let context = 'Legal Name Change.';
  if (newStatus === REPEALED_STATE) {
    context = 'Protected area repealed.'
  }

  // Returns a success response with the updated attributes.
  return sendResponse(200, attributes, 'Protected area record updated', null, context);
}

/**
 * Creates a changelog item for a legal name change.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<void>} - A Promise that resolves when the changelog item is created.
 */
async function createChangeLogItem(body, user, currentTimeISO, currentRecord, newStatus) {
  // Logs the creation of a changelog item.
  logger.info('Creating changelog item');

  // Converts the current record to a format suitable for DynamoDB.
  let changelogRecord = AWS.DynamoDB.Converter.marshall(currentRecord);

  // Sets the 'sk' property of the changelog record to the current time in ISO format.
  changelogRecord['sk'] = { 'S': currentTimeISO };
  changelogRecord['updateDate'] = {'S': currentTimeISO };
  changelogRecord['lastModifiedBy'] = { 'S': user };

  // This will copy the incomign legal, effective, and status as a 'new' item to ensure
  // we record the switch from->to regardless whether 1 or more attributes are changing as
  // part of this majorChange update.
  changelogRecord['newLegalName'] = { 'S': body?.legalName || currentRecord.legalName };
  changelogRecord['newEffectiveDate'] = { 'S': body.effectiveDate };
  changelogRecord['newStatus'] = { 'S': newStatus };
  changelogRecord['status'] = { 'S': HISTORICAL_STATE };
  let legalNameChanged = false;
  let statusChanged = false;
  // Mark whether the status and legalName will change for filtering purposes:
  if (body?.legalName && body?.legalName !== currentRecord.legalName) {
    legalNameChanged = true;
  }
  if (newStatus !== currentRecord.status) {
    statusChanged = true;
  }
  changelogRecord['legalNameChanged'] = { BOOL: legalNameChanged };
  changelogRecord['statusChanged'] = { BOOL: statusChanged };

  return {
    Put: {
      TableName: TABLE_NAME,
      Item: changelogRecord
    }
  }
}

/**
 * Updates a record in DynamoDB.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<Object>} - A Promise that resolves to the updated attributes.
 */
async function updateRecord(identifier, user, body, currentTimeISO, status, updateType, putTransaction = undefined, repealOnly = false) {
  let updatedAttributeValues = {
    ':updateDate': { S: currentTimeISO },
    ':lastModifiedBy': { S: user },
    ':status': { S: status },
    ':lastVersionDate': { S: body.lastVersionDate },
    ':effectiveDate': { S: body.effectiveDate }
  }
  let updateExpression = ['SET updateDate = :updateDate, #status = :status, lastModifiedBy = :lastModifiedBy, effectiveDate = :effectiveDate'];
  if (!repealOnly) {
    for (const field of optionalFields) {
      if (body.hasOwnProperty(field)) {
        updatedAttributeValues[`:${field}`] = { S: body[field] || '' };
        updateExpression.push(`${field} = :${field}`);
      }
    }
  }
  // Defines the parameters for updating the record.
  let updateParams = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: identifier },
      sk: { S: 'Details' }
    },
    ExpressionAttributeValues: updatedAttributeValues,
    ExpressionAttributeNames: { '#status': 'status' },
    UpdateExpression: updateExpression.join(', '),
    ConditionExpression: 'updateDate = :lastVersionDate',
    ReturnValues: 'ALL_NEW'
  };

  // If major change (not repealed), deny if legalName is the same
  if (updateType === 'major') {
    updateParams.ExpressionAttributeValues[':oldLegalName'] = { S: body.legalName };
    updateParams.ConditionExpression += ' AND legalName <> :oldLegalName'
  }

  logger.debug(`Record update params:`, updateParams);

  try {
    // Logs the update parameters for debugging purposes.
    logger.debug(updateParams);

    if (putTransaction) {
      // We can't have this in a transaction.
      delete updateParams.ReturnValues;
      await dynamodb.transactWriteItems({
        TransactItems: [
          putTransaction,
          {
            Update: updateParams
          }
        ]
      }).promise();

      // Return the object we would have inserted.
      let returnItem = {
        pk: identifier,
        sk: 'Details',
        updateDate: currentTimeISO,
        effectiveDate: body.effectiveDate,
        lastModifiedBy: user,
        status: status
      }
      for (const field of optionalFields) {
        if (body.hasOwnProperty(field)) {
          returnItem[field] = body[field];
        }
      }
      return returnItem;
    } else {
      // Executes the update operation and retrieves the updated attributes.
      const { Attributes } = await dynamodb.updateItem(updateParams).promise();

      // Converts the DynamoDB attributes to a more usable format.
      logger.debug('Update success:', AWS.DynamoDB.Converter.unmarshall(Attributes));
      return AWS.DynamoDB.Converter.unmarshall(Attributes);
    }
  } catch (error) {
    // Logs any errors that occur during the update operation.
    logger.error(error);
    let conditionalErrorFlag = false;
    if (error?.CancellationReasons) {
      // Check for ConditionalCheckFailed with transactional update.
      conditionalErrorFlag = error.CancellationReasons.find((item) => {
        if (item?.Code === 'ConditionalCheckFailed') {
          return true;
        }
        return false;
      })
    }
    if (error?.code === 'ConditionalCheckFailedException') {
      // Check for ConditionalCheckFailedException with single item update.
      conditionalErrorFlag = true;
    }
    if (conditionalErrorFlag) {
      // You must provide the updateDate property from the existing record so versioning can be assured
      throw `Field mismatch: If performing a major change, confirm you are providing a new, different legal name. Confirm you are updating the most recent version of the record and try again.`;
    }

    // Propagates the error to the calling function.
    throw error;
  }
}
