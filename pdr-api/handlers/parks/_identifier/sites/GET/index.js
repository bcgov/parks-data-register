const { runQuery, TABLE_NAME, getOne } = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');

exports.handler = async (event, context) => {
    logger.debug('Get list of sites for a protected area', event);
    // Allow CORS
    if (event.httpMethod === 'OPTIONS') {
        return sendResponse(200, {}, 'Success', null, context);
    }

    try {
        const identifier = event.pathParameters.identifier;
        const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);

        // Check if query is valid
        await validateRequest(identifier, isAdmin);

        // SK for PA Site obj is Site::{siteId}
        let query = {
            TableName: TABLE_NAME,
            ExpressionAttributeValues: {
                ':pk': { S: identifier },
                ':beginsWith': { S: 'Site::' }
            },
            KeyConditionExpression: 'pk = :pk and begins_with(sk, :beginsWith)',
        };
        const res = await runQuery(query);

        logger.debug('Get list of sites for a protected area result', res);

        return sendResponse(200, res, 'Success', null, context);
    } catch (err) {
        logger.error(err);
        return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
    }
};

async function validateRequest(identifier, isAdmin) {
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
}
