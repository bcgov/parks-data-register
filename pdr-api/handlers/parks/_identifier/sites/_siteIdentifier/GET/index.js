const { runQuery, TABLE_NAME, getOne } = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');

exports.handler = async (event, context) => {
    logger.debug('Getting a specific site and its history', event);
    // Allow CORS
    if (event.httpMethod === 'OPTIONS') {
        return sendResponse(200, {}, 'Success', null, context);
    }

    try {
        const parkIdentifier = event.pathParameters.identifier;
        const siteIdentifier = event.pathParameters.siteIdentifier;

        const queryParams = event.queryStringParameters;
        const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);
        const sk = queryParams?.sk;
        const status = queryParams?.status;

        // Check if query is valid
        await validateRequest(parkIdentifier, isAdmin, status);

        // SK for PA Site obj is Site::{siteId}
        let query = {
            TableName: TABLE_NAME,
            ExpressionAttributeValues: {
                ':pk': { S: `${parkIdentifier}::Site::${siteIdentifier}` }
            },
            KeyConditionExpression: 'pk = :pk',
        };

        if (sk) {
            query.ExpressionAttributeValues[':sk'] = { S: sk };
            query.KeyConditionExpression += ' AND sk = :sk';
        }

        if (status) {
            query.FilterExpression = '#status = :status';
            query['ExpressionAttributeNames'] = { '#status': 'status' };
            query.ExpressionAttributeValues[':status'] = { S: status };
        }

        // TODO: Account for other filters

        const res = await runQuery(query);

        logger.debug('Getting a specific site and its history result', res);

        return sendResponse(200, res, 'Success', null, context);
    } catch (err) {
        logger.error(err);
        return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
    }
};

async function validateRequest(identifier, isAdmin, status) {
    // Public users are not allowed to see sites that are part of a pending protected area
    let protectedArea = null;
    try {
        protectedArea = await getOne(identifier, 'Details');
    } catch (err) {
        logger.Error('err:', err)
        throw new Error('Error getting protected area');
    }
    if (!isAdmin && protectedArea?.status === 'pending') {
        throw new Error('Not authorized');
    }
    if (!isAdmin && status && status === 'pending') {
        throw new Error('Not authorized');
    }
}
