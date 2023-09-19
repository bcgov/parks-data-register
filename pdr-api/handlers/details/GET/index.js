const { runQuery, TABLE_NAME, STATUS_INDEX_NAME, LEGALNAME_INDEX_NAME } = require("/opt/dynamodb");
const { sendResponse, logger } = require("/opt/base");

exports.handler = async (event, context) => {
  logger.debug("Get details", event);

  try {
    const params = event.queryStringParameters;
    if (!params || !params.assetType === 'park') {
      throw {
        code: 400,
        error: 'Insufficient paramters.',
        msg: "You must provide parameters."
      }
    }

    // Search by assetType status
    const status = event.queryStringParameters.status;
    // Search by assetType identifier (pk)
    const identifier = event.queryStringParameters.identifier;
    // Search by legal name
    const legalName = event.queryStringParameters.legalName;

    if (!status && !identifier && !legalName) {
      throw {
        code: 400,
        error: 'Insufficient parameters.',
        msg: "You must provide a status, identifier, or legal name to search by."
      }
    }

    let query = {};

    if (status) {
      // We want to filter by status.
      query = {
        TableName: TABLE_NAME,
        IndexName: STATUS_INDEX_NAME,
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': { S: status }
        }
      }
    }

    if (identifier) {
      // We are looking for a specific identifier.
      // If query already started, add identifier as filter expression.
      if (Object.keys(query).length > 0) {
        query.ExpressionAttributeValues[':pk'] = { S: identifier };
        query.KeyConditionExpression += " AND pk = :pk"
      } else {
        // else start new query
        query = {
          TableName: TABLE_NAME,
          KeyConditionExpression: 'pk = :pk',
          ExpressionAttributeValues: {
            ':pk': { S: identifier }
          }
        }
      }
    }

    if (legalName) {
      // We are searching by legal name.
      // If query already started, add legalName as a filter expression
      if (Object.keys(query).length > 0) {
        query.ExpressionAttributeValues[':legalName'] = { S: legalName };
        query.FilterExpression = 'legalName = :legalName'
      } else {
        // else start new query
        query = {
          TableName: TABLE_NAME,
          IndexName: LEGALNAME_INDEX_NAME,
          KeyConditionExpression: 'legalName = :legalName',
          ExpressionAttributeValues: {
            ':legalName': { S: legalName }
          }
        }
      }
    }

    logger.debug('Details query:', query);
    const res = await runQuery(query, 10);
    logger.debug('Details query result:', res);

    return sendResponse(200, res, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(err.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};