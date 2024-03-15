const { createDB, deleteDB, getHashedText } = require('../../../../../__tests__/settings');
const { MockData } = require('../../../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Park Site GET', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    const hash = getHashedText(expect.getState().currentTestName);
    process.env.TABLE_NAME = hash;
    dbClient = await createDB(data.allData(), hash);
  });

  afterEach(() => {
    deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV; // Restore old environment
  });

  test('Get all sites for park identifier', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        identifier: '1'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(1);
  });

  test('Get all sites for park identifier OPTIONS', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'OPTIONS',
      pathParameters: {
        identifier: '3'
      },
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    };
    // public not allowed to see status = pending
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
  });

  test('Get all sites for park identifier GET 400 due to invalid identifier', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      pathParameters: {
      },
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    };
    // public not allowed to see status = pending
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });
});