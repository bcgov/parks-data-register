const AWS = require("aws-sdk");
const data = require('./dump.json');
const { Client } = require('@opensearch-project/opensearch');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('./progressIndicator');
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT || 'http://localhost:9200';
const OPENSEARCH_MAIN_INDEX = process.env.OPENSEARCH_MAIN_INDEX || 'main-index';
// Note: it is not clear what the bulk limit is for OpenSearch - based on performance.
// Change the value for BULK_OPERATION_LIMIT as necessary.
// https://repost.aws/knowledge-center/opensearch-indexing-performance
const BULK_OPERATION_LIMIT = 100;

const osClient = new Client({
  node: OPENSEARCH_DOMAIN_ENDPOINT,
  ssl: {
    rejectUnauthorized: false
  }
})

/**
 * Creates an OpenSearch index if it doesn't already exist.
 */
async function establishIndex() {
  // check if index exists
  const exists = await osClient.indices.exists({ index: OPENSEARCH_MAIN_INDEX });
  if (exists.statusCode === 404) {
    // Index doesnt exist
    console.log(`Creating index '${OPENSEARCH_MAIN_INDEX}'`);
    await osClient.indices.create({ index: OPENSEARCH_MAIN_INDEX })
  }
}

async function restoreOpenSearch() {
  console.log("Running OpenSearch importer...");
  let startTime = new Date().getTime();
  try {
    for (let i = 0; i < data.Items.length; i += BULK_OPERATION_LIMIT) {
      updateConsoleProgress(startTime, "Importing", 1, i + 1, data.Items.length);
      let dataChunk = data.Items.slice(i, i + BULK_OPERATION_LIMIT);
      let bulkIndexChunk = [];
      for (const item of dataChunk) {
        bulkIndexChunk.push({
          index: {
            _index: OPENSEARCH_MAIN_INDEX,
            _id: `${item.pk.S}#${item.sk.S}`,
          }
        })
        bulkIndexChunk.push(AWS.DynamoDB.Converter.unmarshall(item))
      }
      await osClient.bulk({
        body: bulkIndexChunk
      })
    }
    updateConsoleProgress(startTime, "Importing", 1, data.Items.length, data.Items.length);
    finishConsoleUpdates();
  } catch (err) {
    console.log("Error populating OpenSearch.");
    throw err;
  }
}

async function run() {
  try {
    // checks to see if OS is running
    await osClient.info();
    await establishIndex();
    await restoreOpenSearch();
  } catch (err) {
    errorConsoleUpdates(err);
  }
}

run();
