const AWS = require("aws-sdk");
const { TABLE_NAME, dynamodb, getOne, putItem } = require('/opt/dynamodb');
const { DateTime } = require('luxon');
const { sendResponse, logger } = require('/opt/base');
const TIMEZONE = 'America/Vancouver';

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

  try {
    // Extracts the 'updateType' parameter from the query string.
    const updateType = event?.queryStringParameters?.updateType;
    const identifier = event.pathParameters.identifier;

    // Parses the request body as JSON.
    let body = JSON.parse(event.body);

    // Force set the body.orcs based on the path parameters
    body.orcs = `${identifier}`;

    // Gets the current date and time in the Pacific Time Zone.
    const currentPSTDateTime = DateTime.now().setZone(TIMEZONE);

    // Converts the current date and time to UTC and then to ISO format.
    const currentTimeISO = currentPSTDateTime.toUTC().toISO();

    // Extracts 'isAdmin' from the request context authorizer.
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);
    const user = event.requestContext?.authorizer?.userID;

    // Ensures all required fields are present in the payload.
    validateRequest(body);

    if (!isAdmin) {
      return sendResponse(403, [], 'Unauthorized', 'Unauthorized');
    }

    // Checks the type of update and calls the corresponding function.
    if (updateType === 'minor') {
      // Don't trigger a legal name change
      return await minorUpdate(user, body, currentTimeISO);
    } else if (updateType === 'major') {
      // Legal Name Change update
      return await majorChange(user, body, currentTimeISO);
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
 * @throws {Error} Throws an error if the payload is invalid.
 * @returns {void}
 */
function validateRequest(body) {
  // Checks if the 'effectiveDate' and 'legalName' properties are present in the payload.
  if (!body.effectiveDate || !body.legalName || !body.status) {
    // Throws an error if the payload is invalid.
    throw new Error('Invalid payload.');
  }
  if (body.status !== 'established' && body.status !== 'repealed') {
    throw new Error('Invalid payload.');
  }
}

/**
 * Handles a minor update.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<Object>} - A Promise that resolves to the response object.
 */
async function minorUpdate(user, body, currentTimeISO) {
  // Calls the 'updateRecord' function to update the record.
  const attributes = await updateRecord(user, body, currentTimeISO);

  // Returns a success response with the updated attributes.
  return sendResponse(200, attributes, 'Record updated');
}

/**
 * Handles a legal name change.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<Object>} - A Promise that resolves to the response object.
 */
async function majorChange(user, body, currentTimeISO) {
  // Creates a changelog item for the legal name change.
  const putTransaction = await createChangeLogItem(body, currentTimeISO);

  // Calls the 'updateRecord' function to update the record.
  const attributes = await updateRecord(user, body, currentTimeISO, putTransaction);

  // Returns a success response with the updated attributes.
  return sendResponse(200, attributes, 'Record updated', 'Legal Name Change');
}

/**
 * Creates a changelog item for a legal name change.
 *
 * @param {string} user - The user making the update.
 * @param {Object} body - The request body.
 * @param {string} currentTimeISO - The current time in ISO format.
 * @returns {Promise<void>} - A Promise that resolves when the changelog item is created.
 */
async function createChangeLogItem(body, currentTimeISO) {
  // Logs the creation of a changelog item.
  logger.info('Creating changelog item');

  // Retrieves the current record based on the 'orcs' identifier.
  const currentRecord = await getOne(body.orcs, 'Details');

  // Converts the current record to a format suitable for DynamoDB.
  let changelogRecord = AWS.DynamoDB.Converter.marshall(currentRecord);

  // Sets the 'sk' property of the changelog record to the current time in ISO format.
  changelogRecord['sk'] = { 'S': currentTimeISO };

  // This will copy the incomign legal, effective, and status as a 'new' item to ensure
  // we record the switch from->to regardless whether 1 or more attributes are changing as
  // part of this majorChange update.
  changelogRecord['newLegalName'] = { 'S': body.legalName };
  changelogRecord['newEffectiveDate'] = { 'S': body.effectiveDate };
  changelogRecord['newStatus'] = { 'S': body.status };
  changelogRecord['status'] = { 'S': 'historical' };

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
async function updateRecord(user, body, currentTimeISO, putTransaction = undefined) {
  // Defines the parameters for updating the record.
  let updateParams = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: body.orcs },
      sk: { S: 'Details' }
    },
    ExpressionAttributeValues: {
      ':updateDate': { S: currentTimeISO },
      ':effectiveDate': { S: body.effectiveDate },
      ':legalName': { S: body.legalName },
      ':displayName': { S: body.displayName },
      ':phoneticName': { S: body.phoneticName },
      ':searchTerms': { S: body.searchTerms },
      ':lastModifiedBy': { S: user },
      ':status': { S: body.status },
      ':notes': { S: body.notes }
    },
    ExpressionAttributeNames: { '#status': 'status' },
    UpdateExpression:
      'SET updateDate = :updateDate, #status = :status , lastModifiedBy = :lastModifiedBy, effectiveDate = :effectiveDate, legalName = :legalName, displayName = :displayName, phoneticName = :phoneticName, searchTerms = :searchTerms, notes = :notes',
    ReturnValues: 'ALL_NEW'
  };

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
      return {
        pk: body.orcs,
        sk: 'Details',
        updateDate: currentTimeISO,
        effectiveDate: body.effectiveDate,
        legalName: body.legalName,
        displayName: body.displayName,
        phoneticName: body.phoneticName,
        searchTerms: body.searchTerms,
        lastModifiedBy: user,
        status: body.status,
        notes: body.note
      }
    } else {
      // Executes the update operation and retrieves the updated attributes.
      const { Attributes } = await dynamodb.updateItem(updateParams).promise();

      // Converts the DynamoDB attributes to a more usable format.
      return AWS.DynamoDB.Converter.unmarshall(Attributes);
    }
  } catch (error) {
    // Logs any errors that occur during the update operation.
    logger.error(error);

    // Propagates the error to the calling function.
    throw error;
  }
}
