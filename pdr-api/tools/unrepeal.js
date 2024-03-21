const AWS = require('aws-sdk');

const TABLE_NAME = 'NameRegister';

const options = {
  region: 'local-env'
};
if (process.env.IS_OFFLINE === 'true') {
  // Env vars evaluate as strings
  options.endpoint = process.env.DYNAMODB_ENDPOINT_URL || 'http://localhost:8000';
}

const dynamodb = new AWS.DynamoDB(options);

const id = process.argv[2];

async function unrepeal() {
  const putAction = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: id },
      sk: { S: 'Details' }
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      ':status': { S: 'established' },
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };
  await dynamodb.updateItem(putAction).promise();
}

unrepeal();
