
// Import necessary libraries and modules
const { OSQuery, OPENSEARCH_MAIN_INDEX, nonKeyableTerms } = require('/opt/opensearch');
const { sendResponse, logger } = require('/opt/base');

// Lambda function entry point
exports.handler = async function (event, context) {
  logger.debug('Changelog search:', event); // Log the search event
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  // Check if the user is an admin
  const isAdmin = event?.requestContext?.authorizer?.isAdmin || false;

  try {
    // Extract query parameters from the event
    const queryParams = event.queryStringParameters;
    // Must provide some kind of filter criteria
    if (!queryParams) {
      throw {
        code: 400,
        msg: 'Query parameters cannot be empty.',
        error: 'Invalid request.'
      }
    }

    // Build query
    const query = new OSQuery(OPENSEARCH_MAIN_INDEX, queryParams?.limit, queryParams?.startFrom, queryParams?.sortField, queryParams?.sortOrder);

    // No searching by status in changelog search
    delete queryParams?.status;

    // Search terms
    let termQuery = { ...queryParams };
    delete termQuery?.changeType;
    for (const term in termQuery) {
      if (nonKeyableTerms.indexOf(term) > -1) {
        delete termQuery[term];
      }
    }
    query.addMustMatchTermsRule(termQuery, true);

    // filter status and legalName changes
    if (queryParams?.changeType) {
      const changeTypes = queryParams.changeType.split(',');
      for (const changeType of changeTypes) {
        query.addShouldMatchTermsRule({ [changeType]: true }, true);
      }
    }

    // Search query text
    if (queryParams?.text) {
      query.addMatchQueryStringRule(queryParams.text)
    }

    // search changelog items only (status = historical)
    query.addMustMatchTermsRule({ status: 'historical' }, true);

    // Perform the search
    const response = await query.search();
    logger.debug('Request:', JSON.stringify(query.request, null, 2)); // Log the request (available after sending)

    // Redact the "notes" field if the user is not an admin
    if (!isAdmin) {
      for (let i = 0; i < response.body.hits.total.value; i++) {
        delete response.body.hits.hits[i]?._source?.notes;
      }
    }

    logger.debug('Response:', JSON.stringify(response)); // Log the response

    // Send success response
    return sendResponse(200, response.body.hits, 'Success', null, context);

  } catch (err) {
    logger.error(JSON.stringify(err)); // Log the error
    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
}
