const AWS = require('aws-sdk');
const fs = require('fs');

// Set up AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION // Replace with your desired region
});

// Create a new DynamoDB instance
const dynamodb = new AWS.DynamoDB();

const filePath = './parks.csv';

const establishedParks = {
  TableName: 'NameRegister',
  IndexName: 'ByStatusOfOrcs',
  KeyConditionExpression: '#status = :status1',
  ExpressionAttributeNames: {
    '#status': 'status'
  },
  ExpressionAttributeValues: {
    ':status1': { S: 'established' }
  }
};

const repealedParks = {
  TableName: 'NameRegister',
  IndexName: 'ByStatusOfOrcs',
  KeyConditionExpression: '#status = :status2',
  ExpressionAttributeNames: {
    '#status': 'status'
  },
  ExpressionAttributeValues: {
    ':status2': { S: 'repealed' }
  }
};

const historicalParks = {
  TableName: 'NameRegister',
  IndexName: 'ByStatusOfOrcs',
  KeyConditionExpression: '#status = :status3',
  ExpressionAttributeNames: {
    '#status': 'status'
  },
  ExpressionAttributeValues: {
    ':status3': { S: 'historical' }
  }
};

/**
 * Retrieves parks from the database based on the provided parameters.
 *
 * @param {Object} params - The parameters for the query.
 * @returns {Promise<Array>} - A promise that resolves to an array of parks.
 */
const getParks = async (params) => {
  let lastEvaluatedKey = null;
  const parks = [];
  do {
    const result = await dynamodb.query({
      ...params,
      ExclusiveStartKey: lastEvaluatedKey
    }).promise();

    if (result.Items) {
      parks.push(...result.Items);
    }

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return parks;
};

/**
 * Writes data to a CSV file.
 *
 * @param {Array<Object>} data - The data to be written to the CSV file.
 * @param {string} filePath - The path of the CSV file.
 * @returns {Promise<void>} - A promise that resolves when the CSV file is written successfully, or rejects with an error.
 */
const writeToCSV = async (data, filePath) => {
  const csvHeader = 'pk,displayId,displayName,legalName,status\n';
  const csvRows = data.map(obj => `${obj.pk.S},${obj.displayId.S},${obj.displayName.S},${obj.legalName.S},${obj.status.S}\n`);
  const csvContent = csvHeader + csvRows.join('');

  try {
    await fs.promises.writeFile(filePath, csvContent);
  } catch (error) {
    console.error('Error writing CSV file:', error);
  }
};

let combinedParks = [];
/**
 * Processes the parks data by retrieving established, repealed, and historical parks,
 * combining them into a single array, and writing the combined parks to a CSV file.
 */
function processParks() {
  getParks(establishedParks)
    .then(established => {
      console.log('Length of established:', established.length);
      combinedParks.push(...established);
      return getParks(repealedParks);
    })
    .then(repealed => {
      console.log('Length of repealed:', repealed.length);
      combinedParks.push(...repealed);
      return getParks(historicalParks);
    })
    .then(historical => {
      console.log('Length of historical:', historical.length);
      combinedParks.push(...historical);
      console.log('Combined Parks:', combinedParks.length);
      return writeToCSV(combinedParks, filePath);
    })
    .then(() => {
      console.log('CSV file written successfully');
    })
    .catch(err => {
      console.error('Error:', err);
    });
}

processParks();
