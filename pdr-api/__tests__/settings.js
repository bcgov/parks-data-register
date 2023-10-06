const REGION = 'local-env';
const ENDPOINT = 'http://localhost:8000';
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister-tests';
const TIMEZONE = 'America/Vancouver';
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const DBMODEL = require('../docs/dbModel.json');
const AWS = require('aws-sdk');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Set the TABLE_NAME to be the test table name in the database model.
// process.env.TABLE_NAME = TABLE_NAME;
DBMODEL.TableName = TABLE_NAME;

async function createDB(items, tableName = TABLE_NAME) {

  const docClient = new DocumentClient({
    region: REGION,
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
  REGION,
  ENDPOINT,
  TABLE_NAME,
  TIMEZONE,
  DBMODEL
};
