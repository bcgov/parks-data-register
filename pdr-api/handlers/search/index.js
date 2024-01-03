// Import necessary libraries and modules
const { OSQuery, OPENSEARCH_MAIN_INDEX, nonKeyableTerms } = require('/opt/opensearch');
const { sendResponse, logger } = require('/opt/base');

// Lambda function entry point
exports.handler = async function (event, context) {
  logger.debug('Search:', event); // Log the search event
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Extract query parameters from the event
    const queryParams = event.queryStringParameters;

    const userQuery = queryParams?.text;
    if (!userQuery) {
      logger.error(`Bad Request - Invalid Params:${JSON.stringify(queryParams)}`);
      return sendResponse(400, {}, 'Bad Request', 'Invalid Params', context);
    }

    // Check if the user is an admin
    const isAdmin = event?.requestContext?.authorizer?.isAdmin || false;

    // Construct the search query
    let query = new OSQuery(OPENSEARCH_MAIN_INDEX, queryParams?.limit, queryParams?.startFrom);
    // Text search
    query.addMatchQueryStringRule(queryParams?.text);
    // Term matching
    let termQuery = { ...queryParams };
    for (const term in termQuery) {
      if (nonKeyableTerms.indexOf(term) > -1) {
        delete termQuery[term];
      }
    }
    query.addMustMatchTermsRule(termQuery, true);
    // Admin permissions
    if (!isAdmin) {
      query.addMustNotMatchTermsRule({ status: 'pending' })
    }

    // Send the query to the OpenSearch cluster
    let response = await query.search();
    logger.debug('Request:', JSON.stringify(query.request)); // Log the request (available after sending)
    logger.debug('Response:', JSON.stringify(response)); // Log the response

    // Redact the "notes" field if the user is not an admin
    if (!isAdmin) {
      for (let i = 0; i < response.body.hits.total.value; i++) {
        delete response.body.hits.hits[i]?._source?.notes;
      }
    }

    // Send a success response
    return sendResponse(200, response.body.hits, 'Success', null, context);
  } catch (err) {
    logger.error(JSON.stringify(err)); // Log the error

    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};