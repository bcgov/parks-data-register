// Import necessary libraries and modules
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT;
const OPENSEARCH_MAIN_INDEX      = process.env.OPENSEARCH_MAIN_INDEX;

import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { sendResponse, logger } from '/opt/base.js';

const client = new Client({
  ...AwsSigv4Signer({
    region: 'ca-central-1',
    service: 'es',
    getCredentials: () => {
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: OPENSEARCH_DOMAIN_ENDPOINT, // OpenSearch domain URL
});

// Lambda function entry point
export const handler = async (event, context) => {
  logger.debug('Search:', event); // Log the search event

  try {
    // Extract query parameters from the event
    const queryParams = event.queryStringParameters;

    if (!queryParams?.text) {
      logger.err(`Bad Request - Invalid Params:${queryParams}`);
      return sendResponse(400, {}, 'Bad Request', 'Invalid Params', context);
    }

    // Check if the user is an admin
    const isAdmin = JSON.parse(event.requestContext?.authorizer?.isAdmin || false);

    // Construct the search query
    const query = {
      query: {
        query_string: {
          query: queryParams?.text,
        },
      },
    };

    // Send the query to the OpenSearch cluster
    let response = await client.search({
      index: OPENSEARCH_MAIN_INDEX, // Index to search
      body: query,
    });
    logger.debug(response); // Log the response

    // Redact the "notes" field if the user is not an admin
    if (!isAdmin) {
      for (let i = 0; i < response.body.hits.total.value; i++) {
        delete response.body.hits.hits[i]._source.notes;
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
