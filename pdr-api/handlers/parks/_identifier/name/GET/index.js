const { runQuery, TABLE_NAME, STATUS_INDEX_NAME, LEGALNAME_INDEX_NAME } = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');

exports.handler = async (event, context) => {
  logger.debug('Get park name details', event);

  try {
    const identifier = event.pathParameters.identifier;
    const status = event.queryStringParameters?.status || null;

    const queryParams = event.queryStringParameters;
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);

    // Check if query is valid
    validateRequest(queryParams, isAdmin);

    // Get name name-related data
    // Currently only have to filter by pk as everything in the db is name-related data
    // This may change if data other than name data is stored within the pk identifier.
    let query = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: identifier }
      }
    };

    // If status provided, switch index to filter by status
    if (status) {
      query.IndexName = STATUS_INDEX_NAME;
      query.KeyConditionExpression += ' AND #status = :status';
      query['ExpressionAttributeNames'] = { '#status': 'status' };
      query.ExpressionAttributeValues[':status'] = { S: status };
    }

    if (!isAdmin) {
      query = setPublicFilters(query, queryParams);
    }

    logger.debug('Get park name query', query);
    let res = await runQuery(query);
    // Prune notes field for non admin users
    if (!isAdmin) {
      for (let i = 0; i < res.items.length; i++) {
        delete res.items[i].notes;
      }
    }
    logger.debug('Get park name result', res);

    return sendResponse(200, res, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(err.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

function validateRequest(queryParams, isAdmin) {
  if (!isAdmin && queryParams?.status === 'pending') {
    // Public users are not allowed to see pending park names
    throw new Error('Not authorized');
  }
}

function setPublicFilters(query, queryParams) {
  if (!queryParams?.status) {
    // If user is public, we redact status = pending
    logger.info('User is public, redacting pending names.');
    query.ExpressionAttributeValues[':pending'] = { S: 'pending' };
    if (!query.ExpressionAttributeNames) {
      query.ExpressionAttributeNames = {};
    }
    query.ExpressionAttributeNames['#status'] = 'status';
    query.FilterExpression = '#status <> :pending';
  }
  // If status is already being filtered then we can skip.
  // We can assume that validateRequest has already removed the case where status = pending and user is public

  return query;
}
