const AWS = require('aws-sdk');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('../tools/progressIndicator');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';

/*
  This migration pulls all the protectedArea items in the database and performs the following updates on each item:

    - status: current -> status: established
    - status: old -> status: historical
    - new attribute: type: protectedArea

  WARNING: at the time of running this script (2023-11-24), protected areas are the only item type in the database. It likely will not be appropriate to run this migration again in the future. This migration leverages DynamoDB scan.
*/

// The number of items a transaction can perform at once
const BATCH_ITEM_LIMIT = 25;

const options = {
  region: 'ca-central-1'
};

if (process.env.IS_OFFLINE === 'true') {
  options.endpoint = process.env.DYNAMODB_ENDPOINT_URL || 'http://localhost:8000';
}

const dynamodb = new AWS.DynamoDB(options);

async function run() {
  try {
    // Get all the items in the database
    const scan = {
      TableName: TABLE_NAME
    }
    const items = await dynamodb.scan(scan).promise();

    // Iterate through the items and update the necessary fields
    let updates = [];
    let skipped = 0;
    for (let item of items.Items) {
      // Future proofing in case this is run again
      // If the item has a type, or type = protectedArea, skip this item
      if (item?.type?.S) {
        if (item?.type?.S !== 'protectedArea' && item?.type?.S !== 'protected-area') {
          skipped++;
          continue;
        }
      }
      // If the item is the config object, don't touch it
      if (item?.pk?.S === 'config') {
        continue;
      }
      // If status: current, update to status: established
      if (item?.status?.S === 'current') {
        item.status = { S: 'established' };
      }
      // If status: old, update to status: historical
      if (item?.status?.S === 'old') {
        item.status = { S: 'historical' };
      }
      // Add type: protectedArea to every remaining record
      item['type'] = { S: 'protectedArea' };
      updates.push(item);
    }

    // batchWrite (PUT) the updates. Note batchWriteItems is an overwrite, not an update
    if (updates.length) {
      let transactionMap = [];
      let transactionMapChunk = { RequestItems: { [TABLE_NAME]: [] } };
      let count = 0;
      let startTime = new Date();
      for (let i = 0; i < updates.length; i += BATCH_ITEM_LIMIT) {
        let updateChunk = updates.slice(i, i + BATCH_ITEM_LIMIT);
        for (const item of updateChunk) {
          count++;
          updateConsoleProgress(startTime, 'Creating batch write object', 10, count, updates.length);
          const putRequest = {
            PutRequest: {
              Item: item
            }
          }
          transactionMapChunk.RequestItems[TABLE_NAME].push(putRequest);
        }
        transactionMap.push(transactionMapChunk);
        transactionMapChunk = { RequestItems: { [TABLE_NAME]: [] } }
      }
      finishConsoleUpdates();
      count = 0;
      startTime = new Date();
      for (const chunk of transactionMap) {
        count++;
        updateConsoleProgress(startTime, 'Batch writing items', 1, count, transactionMap.length);
        await dynamodb.batchWriteItem(chunk).promise();
      }
      finishConsoleUpdates();
      console.log(skipped, 'items skipped.');
    }

  } catch (err) {
    errorConsoleUpdates(err);
  }
}

run();