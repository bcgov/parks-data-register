const { runQuery, TABLE_NAME, getOne } = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');

exports.handler = async (event, context) => {
    logger.debug('Creating new site', event);
    // Allow CORS
    if (event.httpMethod === 'OPTIONS') {
        return sendResponse(200, {}, 'Success', null, context);
    }

    // User must be admin
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);
    if (!isAdmin) {
        return sendResponse(403, {}, 'Not authorized', null, context);
    }

    try {
        const body = JSON.parse(event.body);

        // Gets the current date and time in the Pacific Time Zone.
        const currentPSTDateTime = DateTime.now().setZone(TIMEZONE);
        // Converts the current date and time to UTC and then to ISO format.
        const currentTimeISO = currentPSTDateTime.toUTC().toISO();

        const user = event.requestContext?.authorizer?.userID;

        // Make sure the park exists
        // Also get all objects related to park so we can determine the next id

        // Ensures all required fields are present in the payload.

        // Create park site object
        // Create site object

    } catch (err) {

    }
}