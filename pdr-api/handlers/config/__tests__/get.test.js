const { createDB } = require('../../../__tests__/settings');
const { MockData } = require('../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Specific Park Names GET', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    dbClient = await createDB(data.allData());
    process.env = { ...OLD_ENV }; // Make a copy of environment
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('GET config', async () => {
    const lambda = require('../GET/index');
    const res = await lambda.handler({});
    const warmup = await lambda.handler({ warmup: true });
    expect(JSON.parse(res.body).data).toEqual(data.mockConfig);
    expect(warmup.statusCode).toEqual(200);
  });

  test('GET config error', async () => {
    // If query error
    const dynamodbLayer = require('../../../.aws-sam/build/DynamoDBLayer/dynamodb');
    jest.spyOn(dynamodbLayer, 'runQuery').mockReturnValue(() => new Error);
    const lambda = require('../GET/index');
    const error = await lambda.handler({});
    expect(error.statusCode).toBe(400);
  });
});
