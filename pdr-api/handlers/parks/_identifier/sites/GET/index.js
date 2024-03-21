const { getSitesForProtectedArea } = require('/opt/siteUtils');
const { logger, sendResponse } = require('/opt/base');

exports.handler = async (event, context) => {
  logger.info('Get list of sites for a protected area');
  logger.debug(event);
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Get Protected Area Identifier
    const identifier = event.pathParameters.identifier;

    // Get the sites for this Protected Area
    const sites = await getSitesForProtectedArea(identifier);

    return sendResponse(200, sites, 'Success', null, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, [], err?.msg || 'Error', err?.error || err, context);
  }
};