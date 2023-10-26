const AWS = require('aws-sdk');

const { AWS_REGION, DBMODEL, DYNAMODB_ENDPOINT_URL } = require('./settings');

module.exports = async () => {
  const dynamodb = new AWS.DynamoDB({
    region: AWS_REGION,
    endpoint: DYNAMODB_ENDPOINT_URL
  });

  try {
    await dynamodb.createTable(DBMODEL).promise();
  } catch (err) {
    console.log('err:', err);
  }

};
