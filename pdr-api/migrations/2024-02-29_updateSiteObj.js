const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
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

        const scan = {
            TableName: TABLE_NAME,
            ExpressionAttributeValues: {
                ':beginsWith': { S: 'Site::' }
            },
            FilterExpression: 'begins_with(sk, :beginsWith)'
        }
        const rows = await dynamodb.scan(scan).promise();
        for (const row of rows.Items) {
            // Get site obj
            const getItem = {
                TableName: TABLE_NAME,
                Key: { pk: { S: `${row.pk.S}::${row.sk.S}` }, sk: { S: 'Details' } }
            };
            const site = await dynamodb.getItem(getItem).promise();

            // Update site entry
            const updateParams = {
                TableName: TABLE_NAME,
                Key: {
                    pk: row.pk,
                    sk: row.sk
                },
                ExpressionAttributeValues: {
                    ':displayName': site.Item.displayName
                },
                UpdateExpression: 'SET displayName = :displayName',
                ReturnValues: 'ALL_NEW'
            }
            count++;
            updateConsoleProgress(startTime, 'Batch writing items', 1, count, rows.length);
            await dynamodb.updateItem(updateParams).promise();
        }
        finishConsoleUpdates();
    } catch (err) {
        errorConsoleUpdates(err);
    }
}

run();
