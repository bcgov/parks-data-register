import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT;
const OPENSEARCH_MAIN_INDEX = process.env.OPENSEARCH_MAIN_INDEX

const client = new Client({
  ...AwsSigv4Signer({
    region: 'ca-central-1',
    service: 'es',
    getCredentials: () => {
      // Any other method to acquire a new Credentials object can be used.
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: OPENSEARCH_DOMAIN_ENDPOINT, // OpenSearch domain URL
});

export const handler = async (event) => {
  console.log('Searching:');

  let query = {
    query: {
      query_string: {
        query: 'Taku'
      },
    },
  };

  let response = await client.search({
    index: OPENSEARCH_MAIN_INDEX,
    body: query,
  });

  console.log(JSON.stringify(response.body.hits));

  // TODO implement
  response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
