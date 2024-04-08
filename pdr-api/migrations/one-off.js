const AWS = require('aws-sdk');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('../tools/progressIndicator');
const TABLE_NAME = "NameRegister";
const BATCH_ITEM_LIMIT = 25;

const options = {
  region: 'ca-central-1'
};

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
      if (item?.notes?.S) {
        item['notes'] = { S: item?.notes?.S.trimEnd() };
        updates.push(item);
      }
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
    console.log(err)
  }
}

run();