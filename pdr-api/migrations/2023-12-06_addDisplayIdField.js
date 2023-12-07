const AWS = require('aws-sdk');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('../tools/progressIndicator');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';

/*
  This migration adds a populated displayId field to all protected areas.
  The displayId is the 4-digit leading zero padded pk.
*/

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
    // get all protectedAreas
    const scan = {
      TableName: TABLE_NAME,
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':type': { S: 'protectedArea' }
      },
      FilterExpression: '#type = :type'
    }
    const items = await dynamodb.scan(scan).promise();

    // Iterate through the items and add displayId field
    let updates = [];
    for (let item of items.Items) {
      item['displayId'] = { S: String(item.pk.S).padStart(4, '0') };
      updates.push(item);
    }

    // batchWrite (PUT) the updates. 
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
    }


  } catch (err) {
    errorConsoleUpdates(err);
  }
}

run();