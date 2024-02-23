const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const csv = require('csvtojson');
const { DateTime } = require('luxon');
const { updateConsoleProgress, finishConsoleUpdates, errorConsoleUpdates } = require('../tools/progressIndicator');

/*
  This migration adds sites to the database
*/

const options = {
  region: 'ca-central-1'
};

if (process.env.IS_OFFLINE === 'true') {
  options.endpoint = process.env.DYNAMODB_ENDPOINT_URL || 'http://localhost:8000';
}

const dynamodb = new AWS.DynamoDB(options);

async function run() {
  try {
    let count = 0;
    let startTime = new Date();

    // Import file
    // csv file format
    // ---------------------------------------------------------
    // |    legalName   |  orcs  | siteNumber |     status     |
    // ---------------------------------------------------------
    // | Arrowhead Site |  273   |      1     |  established   |
    // ---------------------------------------------------------
    const rows = await csv().fromFile('sites.csv');

    for (const row of rows) {
      // Common attrs
      let siteObj = {
        pk: AWS.DynamoDB.Converter.input(`${row.orcs}::Site::${row.siteNumber}`)
      };

      //Only importing established sites for now
      if (row.status === 'established') {
        siteObj.sk = AWS.DynamoDB.Converter.input(`Details`);
        siteObj.createDate = AWS.DynamoDB.Converter.input(DateTime.now().setZone('America/Vancouver').toISO());
        siteObj.legalName = AWS.DynamoDB.Converter.input(row.legalName);
        siteObj.displayName = AWS.DynamoDB.Converter.input(row.legalName);
        siteObj.status = AWS.DynamoDB.Converter.input(row.status);
        siteObj.type = AWS.DynamoDB.Converter.input(`site`);
        siteObj.displayId = AWS.DynamoDB.Converter.input(`${row.orcs}-${row.siteNumber}`);
        siteObj.updateDate = AWS.DynamoDB.Converter.input(DateTime.now().setZone('America/Vancouver').toISO());
      }
    
      const putSiteObject = {
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        Item: siteObj
      };

      const putSiteRef = {
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        Item: {
          pk: AWS.DynamoDB.Converter.input(row.orcs),
          sk: AWS.DynamoDB.Converter.input(`Site::${row.siteNumber}`)
        }
      };

      let transaction = {
        TransactItems: [{ Put: putSiteObject }, { Put: putSiteRef }]
      };
      count++;
      updateConsoleProgress(startTime, 'Batch writing items', 1, count, rows.length);
      await dynamodb.transactWriteItems(transaction).promise();
    }
    finishConsoleUpdates();
  } catch (err) {
    errorConsoleUpdates(err);
  }
}

run();
