// Import necessary libraries and modules
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT;
const OPENSEARCH_MAIN_INDEX = process.env.OPENSEARCH_MAIN_INDEX;
const DEFAULT_RESULT_SIZE = 10;
const MAX_RESULT_SIZE = 100;
// Query parameters that should not be used as keyable search terms
const nonKeyableTerms = [
  'text',
  'startFrom',
  'limit'
]

import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { sendResponse, logger } from '/opt/base.js';

let client = new Client({
  ...AwsSigv4Signer({
    region: 'ca-central-1',
    service: 'es',
    getCredentials: () => {
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    }
  }),
  node: OPENSEARCH_DOMAIN_ENDPOINT // OpenSearch domain URL
});

// For offline development
if (process.env.IS_OFFLINE === 'true') {
  client = new Client({
    node: OPENSEARCH_DOMAIN_ENDPOINT,
    ssl: {
      rejectUnauthorized: false
    }
  })
}

// Lambda function entry point
export const handler = async (event, context) => {
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

    let requestedLimit = queryParams?.limit || DEFAULT_RESULT_SIZE;
    if (requestedLimit < 1) {
      requestedLimit = 1;
    }
    if (requestedLimit > MAX_RESULT_SIZE) {
      requestedLimit = MAX_RESULT_SIZE
    }
    const limit = requestedLimit;

    // Generate escaped text
    const escapedQuery = escapeOpenSearchQuery(userQuery);

    // Check if the user is an admin
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);

    // Construct the search query
    let query = {
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: escapedQuery
              }
            }
          ]
        }
      }
    };

    // Build the search query
    query = buildQuery(isAdmin, queryParams, query);

    // Send the query to the OpenSearch cluster
    let response = await client.search({
      index: OPENSEARCH_MAIN_INDEX, // Index to search
      size: limit,
      from: Number(queryParams.startFrom) || 0,
      body: query
    });
    logger.debug(JSON.stringify(response)); // Log the response

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

function escapeOpenSearchQuery(input) {
  // Define a regular expression pattern for reserved characters
  const pattern = /([-&|!(){}[\]^"~*?:\/+])/g;

  // Use the replace method with a callback function to handle replacements
  const escapedQuery = input.replace(pattern, (match, p1) => `\\${p1}`);

  return escapedQuery;
}

// Build the search query
function buildQuery(isAdmin, queryStringParameters, query) {
  try {
    logger.info('Building query');
    for (let key of Object.keys(queryStringParameters)) {
      const value = queryStringParameters[key].toLowerCase();
      // Remove nonKeyableTerms from params, they are sent in another part of the query
      if (nonKeyableTerms.indexOf(key) === -1) {
        // Multiple terms to be comma seperated eg. ?status=current,pending
        const terms = value.split(',');
        query.query.bool.must.push({
          terms: {
            [key]: terms
          }
        });
      }
    }

    // Prevent any non-admins from seeing protected areas with a status of 'pending'
    if (!isAdmin) {
      query.query.bool['must_not'] = [];
      query.query.bool.must_not.push({
        match: {
          status: 'pending'
        }
      });
    }

    logger.debug('Query:', JSON.stringify(query));
    return query;

  } catch (err) {
    logger.error(JSON.stringify(err)); // Log the error

    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
}
