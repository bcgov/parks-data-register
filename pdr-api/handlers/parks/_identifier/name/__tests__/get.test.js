const { createDB } = require('../../../../../__tests__/settings');
const { MockData } = require('../../../../../__tests__/mock_data');

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

  test('No query params provided', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET'
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
      }
    }
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(2);
  });

  test('Get all current name information for park identifier', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        status: 'current'
      },
      pathParameters: {
        identifier: '1'
      }
    }
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(1);
    expect(body.data.items[0].status).toEqual('current');
  });

});