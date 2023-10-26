const AWS_REGION = process.env.AWS_REGION || 'local-env';
const ENDPOINT = 'http://localhost:8000';
const DYNAMODB_ENDPOINT_URL = process.env.DYNAMODB_ENDPOINT_URL = ENDPOINT;
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegistry-tests';
const TIMEZONE = 'America/Vancouver';
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const DBMODEL = require('../docs/dbModel.json');
const AWS = require('aws-sdk');
process.env.LOG_LEVEL = 'info';
process.env.IS_OFFLINE = 'true';

// Set the TABLE_NAME to be the test table name in the database model.
// process.env.TABLE_NAME = TABLE_NAME;
DBMODEL.TableName = TABLE_NAME;

async function createDB(items, tableName = TABLE_NAME) {

  const docClient = new DocumentClient({
    region: AWS_REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true
  });

  if (!items.length) {
    items = [items];
  }

  for (const item of items) {
    await docClient.put({
      TableName: tableName,
      Item: item
    }).promise();
  }

  return docClient;
}

module.exports = {
  createDB,
  DYNAMODB_ENDPOINT_URL,
  AWS_REGION,
  ENDPOINT,
  TABLE_NAME,
  TIMEZONE,
  DBMODEL
};
