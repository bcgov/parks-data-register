// Import necessary libraries and modules
const { sendResponse, logger } = require('/opt/base');
const { TABLE_NAME, deleteItem, dynamodb, getOne } = require('/opt/dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { FEES_OPTIONAL_PUT_FIELDS } = require('/opt/data-constants');

exports.handler = async function (event, context) {
  logger.debug('Search:', event); 
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  //Stop right away if no authorizer
  if (!event.requestContext?.authorizer) {
    logger.error('No authorizer');
    return sendResponse(403, {}, 'Bad Request', 'Unauthorized', context);
  }

  //No query params return 400
  if (!event.queryStringParameters) {
    logger.error('Bad Request - Missing query string parameters');
    return sendResponse(400, {}, 'Bad Request', 'Missing parameters', context);
  }

  try {
    const queryParams = event.queryStringParameters;
    logger.debug('Query Parameters:', queryParams);
    const requiredParams = ['ORCS', 'parkFeature', 'activity', 'billingBy'];

    //Ensure all required parameters
    for (const param of requiredParams) {
      if (!queryParams?.[param]) {
        logger.error(`Bad Request - Missing Param: ${param}`);
        return sendResponse(400, {}, 'Bad Request', `Missing Param: ${param}`, context);
      }
    }

    // Check if the user is an admin
    const isAdmin = event?.requestContext?.authorizer?.isAdmin || false;

    if (isAdmin) {
      // If chargeBy is included, delete just a parameter
      if (queryParams.chargeBy) {
        return await deleteParameter(queryParams, context);
      } else {
        // Charge by is not included, so delete the whole record
        return await deleteWholeRecord(queryParams, context);
      }
    } else {
      // Not an admin
      return sendResponse(400, {}, 'Bad Request', 'must be admin to delete a fee', context);
    }
  } catch (err) {
    logger.error('Error:', JSON.stringify(err));
    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

const deleteParameter = async (queryParams, context) => {
  const item = {
    pk: `${queryParams.ORCS}::FEES`,
    sk: `${queryParams.parkFeature}::${queryParams.activity}::${queryParams.billingBy}`
  };
  logger.debug('Constructed Item:', item);
  try {
    const currentItem = await getOne(item.pk, item.sk);
    const chargeByAttributes = Object.keys(currentItem).filter(attr => FEES_OPTIONAL_PUT_FIELDS.includes(attr));
    switch (true) {
      case Object.keys(currentItem).length === 0:
        logger.error('Item not found in DynamoDB');
        return sendResponse(404, {}, 'Not Found', 'Item does not exist in DynamoDB', context);

      case chargeByAttributes.length === 1:
        logger.error('Cannot delete the last chargeBy attribute');
        return sendResponse(400, {}, 'Bad Request', 'Cannot delete the last chargeBy attribute', context);

      case !chargeByAttributes.includes(queryParams.chargeBy) || !FEES_OPTIONAL_PUT_FIELDS.includes(queryParams.chargeBy):
        logger.error('ChargeBy attribute not found in current item');
        return sendResponse(400, {}, 'Bad Request', 'The supplied chargeBy attribute is not valid in this request', context);

      default:
        // No issues 
        break;
    }
  }catch (error) {
    logger.error('DynamoDB Error:', JSON.stringify(error));
    return sendResponse(500, {}, 'Internal Server Error', 'Failed to fetch item from DynamoDB', context);
  }
  
  logger.debug('Constructed Item:', item);
  const updateParams = {
    TableName: TABLE_NAME,
    Key: marshall(item),
    UpdateExpression: `REMOVE #attr`,
    ExpressionAttributeNames: {
      '#attr': queryParams.chargeBy
    },
    ReturnValues: 'ALL_NEW'
  };
  try {
    const res = await dynamodb.updateItem(updateParams);
    logger.debug('DynamoDB Response:', unmarshall(res.Attributes));
    return sendResponse(200, unmarshall(res.Attributes), 'Success', null, context);
  } catch (error) {
    logger.error('DynamoDB Error:', JSON.stringify(error));
    return sendResponse(500, {}, 'Internal Server Error', 'Failed to delete parameter from item in DynamoDB', context);
  }
};

const deleteWholeRecord = async (queryParams, context) => {
  const item = {
    pk: `${queryParams.ORCS}::FEES`,
    sk: `${queryParams.parkFeature}::${queryParams.activity}::${queryParams.billingBy}`
  };
  const currentItem = await getOne(item.pk, item.sk);
  //If getOne is empty there is no match in db to delete.
  if (Object.keys(currentItem).length === 0) {
    logger.error('Item not found in DynamoDB');
    return sendResponse(404, {}, 'Not Found', 'Item does not exist in DynamoDB', context);
  }
  logger.debug('Constructed Item:', item);
  try {
    const res = await deleteItem(marshall(item), TABLE_NAME);
    logger.debug('DynamoDB Response:', res);
    return sendResponse(200, res, 'Success', null, context);
  } catch (error) {
    logger.error('DynamoDB Error:', JSON.stringify(error));
    return sendResponse(500, {}, 'Internal Server Error', 'Failed to delete item from DynamoDB', context);
  }
};