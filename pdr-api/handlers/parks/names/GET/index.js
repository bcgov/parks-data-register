
const { runQuery, TABLE_NAME, STATUS_INDEX_NAME, LEGALNAME_INDEX_NAME } = require("/opt/dynamodb");
const { sendResponse, logger } = require("/opt/base");

exports.handler = async (event, context) => {
  logger.debug("Get all park names details", event);

  try {
    const queryParams = event.queryStringParameters;

    let query = {};

    if (queryParams?.legalName) {
      // We want to search by legal name
      query = queryByLegalName(queryParams.legalName, queryParams?.status)
    } else if (queryParams?.status) {
      // We want to get park names by status
      query = queryByStatus(queryParams.status)
    } else {
      throw {
        code: 400,
        error: 'Insufficient parameters.',
        msg: `Missing at least one required query parameter: 'status' or 'legalName'`
      }
    }

    logger.debug('Get all park names query', query);
    const res = await runQuery(query);
    logger.debug('Get all park names result', res);

    return sendResponse(200, res, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(err.code || 400, [], err?.msg || 'Error', err?.error || err, context);
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
  }

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
  }
}