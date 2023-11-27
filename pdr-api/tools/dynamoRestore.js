const AWS = require('aws-sdk');

const data = require('./dump.json');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('./progressIndicator');

const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const MAX_TRANSACTION_SIZE = 25;

const options = {
  region: 'local',
  endpoint: 'http://localhost:8000'
}

console.log("USING CONFIG:", options);

const dynamodb = new AWS.DynamoDB(options);

async function run() {
  console.log("Running importer");
  let startTime = new Date().getTime();
  try {
    for (let i = 0; i < data.Items.length; i += MAX_TRANSACTION_SIZE) {
      updateConsoleProgress(startTime, "Importing", 1, i + 1, data.Items.length);
      let dataChunk = data.Items.slice(i, i + MAX_TRANSACTION_SIZE);
      let batchWriteChunk = { RequestItems: {[TABLE_NAME]: []} };
      for (const item of dataChunk) {
        batchWriteChunk.RequestItems[TABLE_NAME].push({
          PutRequest: {
            Item: item
          }
        });
      }
      await dynamodb.batchWriteItem(batchWriteChunk).promise();
    }
    updateConsoleProgress(startTime, "Importing", 1, data.Items.length, data.Items.length);
    finishConsoleUpdates();
  } catch (error) {
    errorConsoleUpdates(error);
  }
}

run();
