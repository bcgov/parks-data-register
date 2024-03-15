const { createDB, deleteDB, getHashedText } = require('../../../../../__tests__/settings');
const { MockData } = require('../../../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Specific Park Names GET', () => {
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

  test('No query params provided', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });


  test('Get all name information for park identifier', async () => {
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
    }
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(3);
  });

  test('Get all current name information for park identifier', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        status: 'established'
      },
      pathParameters: {
        identifier: '1'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(1);
    expect(body.data.items[0].status).toEqual('established');
  });

  test('Public user', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        identifier: '1'
      },
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
    event.queryStringParameters = {
      status: 'pending'
    };
    // public not allowed to see status = pending
    const res2 = await lambda.handler(event, null);
    expect(res2.statusCode).toBe(400);
  });
});