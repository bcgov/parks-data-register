
const { runQuery, TABLE_NAME, STATUS_INDEX_NAME, LEGALNAME_INDEX_NAME } = require("/opt/dynamodb");
const { sendResponse, logger } = require("/opt/base");

exports.handler = async (event, context) => {
  logger.debug("Get park name details", event);

  try {
    const identifier = event.pathParameters.identifier;
    const status = event.queryStringParameters?.status || null;

    // Get name name-related data
    // Currently only have to filter by pk as everything in the db is name-related data
    // This may change if data other than name data is stored within the pk identifier.
    let query = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: identifier },
      },
    }

    // If status provided, switch index to filter by status
    if (status) {
      query.IndexName = STATUS_INDEX_NAME;
      query.KeyConditionExpression += ' AND #status = :status';
      query['ExpressionAttributeNames'] = { '#status': 'status' };
      query.ExpressionAttributeValues[':status'] = { S: status };
    }

    logger.debug('Get park name query', query);
    const res = await runQuery(query);
    logger.debug('Get park name result', res);


    return sendResponse(200, res, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(err.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};
