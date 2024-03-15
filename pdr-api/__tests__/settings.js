const AWS_REGION = process.env.AWS_REGION || 'local-env';
const ENDPOINT = 'http://localhost:8000';
const DYNAMODB_ENDPOINT_URL = process.env.DYNAMODB_ENDPOINT_URL = ENDPOINT;
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegistry-tests';
const TIMEZONE = 'America/Vancouver';
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
let DBMODEL = require('../docs/dbModel.json');
const AWS = require('aws-sdk');

const crypto = require('crypto');

process.env.LOG_LEVEL = 'info';
process.env.IS_OFFLINE = 'true';

async function createDB(items, tableName = TABLE_NAME) {
  // Set the TABLE_NAME to be the test table name in the database model.
  DBMODEL.TableName = tableName;
  const dynamodb = new AWS.DynamoDB({
    region: AWS_REGION,
    endpoint: DYNAMODB_ENDPOINT_URL
  });

  try {
    await dynamodb.createTable(DBMODEL).promise();
  } catch (err) {
    console.error(err);
  }

  const docClient = new DocumentClient({
    region: AWS_REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true
  });

  // If there are no items to create after creating the DB, just return the client handler.
  if (!items) {
    return docClient;
  }

  // If the item passed in wasn't an array, turn it into one.
  if (!items.length) {
    items = [items];
  }

  for (const item of items) {
    await docClient.put({
      TableName: DBMODEL.TableName,
      Item: item
    }).promise();
  }

  return docClient;
}

async function deleteDB(tableName = TABLE_NAME) {
  const dynamoDb = new AWS.DynamoDB({
    region: AWS_REGION,
    endpoint: ENDPOINT
  });

  try {
    await dynamoDb
      .deleteTable({
        TableName: tableName
      })
      .promise();
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
