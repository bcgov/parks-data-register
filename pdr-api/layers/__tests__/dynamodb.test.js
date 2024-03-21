const { createDB, deleteDB, getHashedText } = require('../../__tests__/settings');
const { MockData } = require('../../__tests__/mock_data');
const AWS = require('aws-sdk');

const data = new MockData;
let dbClient;

// For testing purposes, layers should be required from the /.aws-sam/build/ folder to have access to their own node modules.

describe('DynamoDB Layer Tests', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    const hash = getHashedText('DynamoDB Layer Tests');
    process.env.TABLE_NAME = hash;
    dbClient = await createDB([
      data.mockCurrentParkName1,
      data.mockCurrentParkName2,
      data.mockOldParkName1,
      data.mockParkSite1
    ], hash);
  });

  afterEach(async () => {
    await deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV; // Restore old environment
  });

  test('Get one item', async () => {
    const layer = require('../../.aws-sam/build/AWSUtilsLayer/dynamodb');
    // item exists
    const exists = await layer.getOne('1', 'Details');
    expect(exists.pk).toEqual('1');
    expect(exists.sk).toEqual('Details');
    // item does not exist
    const notExists = await layer.getOne('badpk', 'badsk');
    expect(notExists).toEqual({});
  });

  test('Put one item', async () => {
    const layer = require('../../.aws-sam/build/AWSUtilsLayer/dynamodb');

    const insertedRecord = { pk: { S: '123put' }, sk: { S: 'Details' }};

    // Put the item into the db
    await layer.putItem(insertedRecord);

    // It should be there
    const record = await layer.getOne('123put', 'Details');
    expect(record).toEqual(AWS.DynamoDB.Converter.unmarshall(insertedRecord));
  });

  test('Run Query', async () => {
    const layer = require('../../.aws-sam/build/AWSUtilsLayer/dynamodb');
    const query = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: '1' }
      }
    }
    // Regular query
    const regQuery = await layer.runQuery(query);
    expect(regQuery.items).toEqual(expect.arrayContaining([
      data.mockCurrentParkName1,
      data.mockOldParkName1
    ]));

    // Limited query
    const limitQuery = await layer.runQuery(query, 1);
    expect(limitQuery.items.length).toEqual(1);
    expect(limitQuery).toHaveProperty('lastEvaluatedKey');

    // Starting from lastEvaluatedKey
    const layerLEKQuery = { ExclusiveStartKey: limitQuery.lastEvaluatedKey, ...query };
    const querySpy = jest.spyOn(layer.dynamodb, 'query');
    const lekRes = await layer.runQuery(query, null, limitQuery.lastEvaluatedKey);
    const nextEvaluatedKey = {
      pk: { S: lekRes.items[0].pk },
      sk: { S: lekRes.items[0].sk }
    }
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(layerLEKQuery);
    expect(limitQuery.lastEvaluatedKey).not.toEqual(nextEvaluatedKey);

    // No pagination - expect query to be called multiple times
    querySpy.mockClear();
    await layer.runQuery(query, 1, null, false);
    expect(querySpy.mock.calls.length).toBeGreaterThan(1);
  })

  test('Run Scan', async () => {
    const layer = require('../../.aws-sam/build/AWSUtilsLayer/dynamodb');
    const scan = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: '1' }
      }
    }
    // Regular scan
    const regScan = await layer.runScan(scan);
    expect(regScan.items).toEqual(expect.arrayContaining([
      data.mockCurrentParkName1,
      data.mockOldParkName1
    ]));

    // // Limited scan
    const limitScan = await layer.runScan(scan, 1);
    expect(limitScan.items.length).toEqual(1);
    expect(limitScan).toHaveProperty('lastEvaluatedKey');

    // Starting from lastEvaluatedKey
    const layerLEKScan = { ExclusiveStartKey: limitScan.lastEvaluatedKey, ...scan };
    const scanSpy = jest.spyOn(layer.dynamodb, 'scan');
    const lekRes = await layer.runScan(scan, null, limitScan.lastEvaluatedKey);
    const nextEvaluatedKey = {
      pk: { S: lekRes.items[0].pk },
      sk: { S: lekRes.items[0].sk }
    }
    expect(scanSpy).toHaveBeenCalledTimes(1);
    expect(scanSpy).toHaveBeenCalledWith(layerLEKScan);
    expect(limitScan.lastEvaluatedKey).not.toEqual(nextEvaluatedKey);

    // No pagination - expect scan to be called multiple times
    scanSpy.mockClear();
    await layer.runScan(scan, 1, null, false);
    expect(scanSpy.mock.calls.length).toBeGreaterThan(1);
  });

  test('Batch Write Item', async () => {
    const layer = require('../../.aws-sam/build/AWSUtilsLayer/dynamodb');
    const recordSize = 51;
    const chunkSize = 5;
    let records = [];

    for (let i = 0; i < recordSize; i++) {
      let jsonObject = {
        pk: `{BatchWrite${i}}`,
        sk: 'Details'
      };
      records.push(AWS.DynamoDB.Converter.marshall(jsonObject));
    }

    const querySpy = jest.spyOn(layer.dynamodb, 'batchWriteItem');
    await layer.batchWriteData(records, chunkSize, process.env.TABLE_NAME);

    const fullBatchesCount = recordSize / chunkSize;
    const remainder = recordSize % chunkSize;

    expect(querySpy).toHaveBeenCalledTimes(Math.floor(fullBatchesCount) + remainder);
  });
});