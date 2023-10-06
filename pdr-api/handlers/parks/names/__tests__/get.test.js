const { createDB } = require('../../../../__tests__/settings');
const { MockData } = require('../../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('All Park Names GET', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    dbClient = await createDB(data.allData());
    process.env = { ...OLD_ENV }; // Make a copy of environment
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('Unauthorized', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET'
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
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
    console.log('res:', res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Insufficient parameters.')
  });

  test('Get all current park names', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        status: 'current'
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
    expect(body.data.items.length).toBe(2);
  });

  test('Search all park names by legal name', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        legalName: 'Old Park 1'
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
    expect(body.data.items[0].legalName).toEqual('Old Park 1');
  });

  test('Search all park names by legal name and status', async () => {
    const lambda = require('../GET/index');
    const event1 = {
      httpMethod: 'GET',
      queryStringParameters: {
        legalName: 'Old Park 1',
        status: 'current'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const event2 = {
      httpMethod: 'GET',
      queryStringParameters: {
        legalName: 'Test Park 1',
        status: 'current'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res1 = await lambda.handler(event1, null);
    const body1 = JSON.parse(res1.body);
    expect(res1.statusCode).toBe(200);
    expect(body1.data.items.length).toBe(0);
    const res2 = await lambda.handler(event2, null);
    const body2 = JSON.parse(res2.body);
    expect(res2.statusCode).toBe(200);
    expect(body2.data.items.length).toBe(1);
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
      },
      queryStringParameters: {
        status: 'current'
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
    event.queryStringParameters.status = 'pending';
    const res2 = await lambda.handler(event, null);
    expect(res2.statusCode).toBe(400);
  });

});