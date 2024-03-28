const AWS_REGION = process.env.AWS_REGION || 'local-env';
const ENDPOINT = 'http://localhost:8000';
const DYNAMODB_ENDPOINT_URL = process.env.DYNAMODB_ENDPOINT_URL = ENDPOINT;
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegistry-tests';
const TIMEZONE = 'America/Vancouver';
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
let DBMODEL = require('../docs/dbModel.json');

const crypto = require('crypto');

process.env.LOG_LEVEL = 'info';
process.env.IS_OFFLINE = 'true';

async function createDB(items, tableName = TABLE_NAME) {
  // Set the TABLE_NAME to be the test table name in the database model.
  DBMODEL.TableName = tableName;
  const dynamodb = new DynamoDB({
    region: AWS_REGION,
    endpoint: DYNAMODB_ENDPOINT_URL
  });

  try {
    await dynamodb.createTable(DBMODEL);
  } catch (err) {
    console.error(err);
  }

  // If there are no items to create after creating the DB, just return the client handler.
  if (!items) {
    return dynamodb;
  }

  // If the item passed in wasn't an array, turn it into one.
  if (!items.length) {
    items = [items];
  }

  for (const item of items) {
    await dynamodb.putItem({
      TableName: tableName,
      Item: marshall(item)
    });
  }

  return dynamodb;
}

async function deleteDB(tableName = TABLE_NAME) {
  const dynamoDb = new DynamoDB({
    region: AWS_REGION,
    endpoint: ENDPOINT
  });

  try {
    await dynamoDb
      .deleteTable({
        TableName: tableName
      });
  } catch (err) {
    console.error(err);
  }
}

// Generate hashed text
function getHashedText(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = {
  AWS_REGION,
  DBMODEL,
  DYNAMODB_ENDPOINT_URL,
  ENDPOINT,
  TABLE_NAME,
  TIMEZONE,
  createDB,
  deleteDB,
  getHashedText
};
