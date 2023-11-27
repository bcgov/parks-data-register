const { runQuery, TABLE_NAME } = require('/opt/dynamodb');
const { sendResponse, checkWarmup, logger } = require('/opt/base');

exports.handler = async (event, context) => {
  logger.debug('Read Config', event);
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  if (checkWarmup(event)) {
    return sendResponse(200, [], 'Warm up.', null);
  }

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    queryObj.ExpressionAttributeValues = {};
    queryObj.ExpressionAttributeValues[':pk'] = { S: 'config' };
    queryObj.ExpressionAttributeValues[':sk'] = { S: 'config' };
    queryObj.KeyConditionExpression = 'pk =:pk AND sk =:sk';

    const configData = await runQuery(queryObj);
    return sendResponse(200, configData.items[0], 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, [], 'Error', err, context);
  }
};
