const AWS = require('aws-sdk');

const { REGION, ENDPOINT, DBMODEL } = require('./settings');

module.exports = async () => {
  const dynamoDb = new AWS.DynamoDB({
    region: REGION,
    endpoint: ENDPOINT
  });

  try {
    await dynamoDb.createTable(DBMODEL).promise();
  } catch (err) {
    console.log('err:', err);
  }
};
