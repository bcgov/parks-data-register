const { runQuery, TABLE_NAME, STATUS_INDEX_NAME, LEGALNAME_INDEX_NAME } = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');

exports.handler = async (event, context) => {
  logger.debug('Get all park names details', event);

  try {
    const queryParams = event.queryStringParameters;
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);

    // Check if query is valid
    validateRequest(queryParams, isAdmin);

    let query = {};

    if (queryParams?.legalName) {
      // We want to search by legal name
      query = queryByLegalName(queryParams.legalName, queryParams?.status);
    } else if (queryParams?.status) {
      // We want to get park names by status
      query = queryByStatus(queryParams.status);
    } else {
      throw {
        code: 400,
        error: 'Insufficient parameters.',
        msg: `Missing at least one required query parameter: 'status' or 'legalName'`
      };
    }

    if (!isAdmin) {
      query = setPublicFilters(query, queryParams);
    }

    logger.debug('Get all park names query', query);
    let res = await runQuery(query);

    // Prune notes field for non admin users
    if (!isAdmin) {
      for (let i = 0; i < res.items.length; i++) {
        delete res.items[i].notes;
      }
    }

    logger.debug('Get all park names result', res);

    return sendResponse(200, res, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

function queryByLegalName(legalName, status = null) {
  let query = {
    TableName: TABLE_NAME,
    IndexName: LEGALNAME_INDEX_NAME,
    KeyConditionExpression: 'legalName = :legalName',
    ExpressionAttributeValues: {
      ':legalName': { S: legalName }
    }
  };

  if (status) {
    query.FilterExpression = '#status = :status';
    query['ExpressionAttributeNames'] = { '#status': 'status' };
    query.ExpressionAttributeValues[':status'] = { S: status };
  }

  return query;
}

function queryByStatus(status) {
  return {
    TableName: TABLE_NAME,
    IndexName: STATUS_INDEX_NAME,
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': { S: status }
    }
  };
}

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
