const { getNowISO, logger, sendResponse } = require('/opt/base');
const { requireAdmin } = require('/opt/permissions');
const { createSitePutTransaction } = require('/opt/siteUtils');
const { batchTransactData } = require('/opt/dynamodb');

exports.handler = async (event, context) => {
  logger.debug('Site PUT', event);

  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Check permissions.
    requireAdmin(event);

    // Get event variables.
    const identifier = event.pathParameters.identifier;
    const queryParams = event.queryStringParameters;
    const body = JSON.parse(event.body);
    const user = event.requestContext?.authorizer?.userID;
    const currentTimeISO = getNowISO();

    // Perform update.
    const transactions = await createSitePutTransaction(identifier, body, queryParams?.updateType, user,
      currentTimeISO);

    await batchTransactData(transactions);

    return sendResponse(200, [], `Site ${identifier} updated.`, null, context);
  } catch (error) {
    return sendResponse(error?.code || 400, [], error?.msg || 'Error', error?.error || error, context);
  }
};