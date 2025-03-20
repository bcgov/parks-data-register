const { dynamodb, getOne, TABLE_NAME } = require('/opt/dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { sendResponse, logger } = require('/opt/base');
const { FEES_OPTIONAL_PUT_FIELDS } = require('/opt/data-constants');

exports.handler = async (event, context) => {
  logger.info('Update a fee record:', event);
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  // Extract 'isAdmin' from the request context authorizer
  const isAdmin = event.requestContext?.authorizer?.isAdmin || false;

  if (!isAdmin) {
    return sendResponse(403, [], 'Unauthorized', 'Unauthorized');
  }

  try {
    // Extract query string parameters
    const queryParams = event.queryStringParameters;
    logger.debug('Query Parameters:', queryParams);

    const requiredParams = ['ORCS', 'parkFeature', 'activity', 'billingBy'];
    for (const param of requiredParams) {
      if (!queryParams?.[param]) {
        logger.error(`Bad Request - Missing Param: ${param}`);
        return sendResponse(400, {}, 'Bad Request', `Missing Param: ${param}`, context);
      }
    }
    
    const pk = `${queryParams.ORCS}::FEES`;
    const sk = `${queryParams.parkFeature}::${queryParams.activity}::${queryParams.billingBy}`;

    // Parse the request body as JSON
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      logger.error('Bad Request - Invalid JSON in request body');
      return sendResponse(400, {}, 'Bad Request', 'Invalid JSON in request body', context);
    }

    // Check if the body contains at least one of the FEES_OPTIONAL_PUT_FIELDS
    const hasOptionalField = FEES_OPTIONAL_PUT_FIELDS.some(field => body.hasOwnProperty(field));
    if (!hasOptionalField) {
      logger.error('Bad Request - Missing required fields in body');
      return sendResponse(400, {}, 'Bad Request', 'Missing required fields in body', context);
    }

    // If no currentRecord exists, we shouldn't perform any actions
    const currentRecord = await getOne(pk, sk);
    if (!currentRecord?.pk) {
      logger.error(`Protected area with identifier '${queryParams.ORCS}' not found.`);
      return sendResponse(400, {}, 'Bad Request', `Protected area with identifier '${queryParams.ORCS}' not found.`, context);
    }

    // Call the 'updateRecord' function to update the fee
    let attributes = await updateRecord(pk, sk, body);
    return sendResponse(200, attributes, 'Record updated');
  } catch (error) {
    // Log any caught errors
    logger.error('Error:', error);
    return sendResponse(400, [], error?.msg || 'Error', error?.error || error, context);
  }
};

/**
 * Updates a record in DynamoDB.
 *
 * @param {String} pk
 * @param {String} sk
 * @param {Object} body - The request body.
 * @returns {Promise<Object>} - A Promise that resolves to the updated attributes.
 */
async function updateRecord(pk, sk, body) {
  let attributeName;
  let expressionAttributeNames = {};
  let updatedAttributeValues = {};
  let updateExpression = [];

  for (const field of FEES_OPTIONAL_PUT_FIELDS) {
    if (body.hasOwnProperty(field)) {
      attributeName = `#${field}`;
      expressionAttributeNames[attributeName] = field;
      updatedAttributeValues[`:${field}`] = { S: body[field] || '' };
      updateExpression.push(`${attributeName} = :${field}`);
    }
  }

  const updateParams = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: pk },
      sk: { S: sk }
    },
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: updatedAttributeValues,
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ReturnValues: 'ALL_NEW'
  };

  try {
    
    // Update the item
    logger.debug('updateParams', updateParams);
    const { Attributes } = await dynamodb.updateItem(updateParams);

    // success unmarshall
    logger.debug('Update success:', unmarshall(Attributes));
    return unmarshall(Attributes);

  } catch (error) {
    // Log any errors that occur during the update operation
    logger.error(error);
    let conditionalErrorFlag = false;
    if (error?.CancellationReasons) {
      // Check for ConditionalCheckFailed with transactional update
      conditionalErrorFlag = error.CancellationReasons.find(item => {
        if (item?.Code === 'ConditionalCheckFailed') {
          return true;
        }
        return false;
      });
    }
    if (error?.code === 'ConditionalCheckFailedException') {
      // Check for ConditionalCheckFailedException with single item update
      conditionalErrorFlag = true;
    }
    if (conditionalErrorFlag) {
      throw `Field mismatch: Error during update.`;
    }
    throw error;
  }
}
