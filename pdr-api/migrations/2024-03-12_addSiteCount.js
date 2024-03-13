const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const { finishConsoleUpdates, errorConsoleUpdates } = require('../tools/progressIndicator');

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
                ':sk': { S: 'Details' }
            },
            FilterExpression: 'sk = :sk'
        }

        const parks = (await dynamodb.scan(scan).promise()).Items;
        for (const park of parks) {
            const siteScan = {
                TableName: TABLE_NAME,
                ExpressionAttributeValues: {
                    ':pk': park.pk,
                    ':beginsWith': { S: 'Site::' }
                },
                FilterExpression: 'pk = :pk AND begins_with(sk, :beginsWith)'
            }
            const sites = (await dynamodb.scan(siteScan).promise()).Items;
            console.log(sites.length);

            count++;
            updateConsoleProgress(startTime, 'Batch writing items', 1, count, parks.length);
        }
        finishConsoleUpdates();
    } catch (err) {
        errorConsoleUpdates(err);
    }
}

run();
