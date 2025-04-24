const { createDB, deleteDB, getHashedText } = require('../../../__tests__/settings');
const { MockData } = require('../../../__tests__/mock_data');
const data = new MockData;
let dbClient;

describe('Update Fees Tests', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    const hash = getHashedText(expect.getState().currentTestName);
    process.env.TABLE_NAME = hash;
    dbClient = await createDB(data.allData(), hash);
  });

  afterEach(() => {
    deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV;
  });

  test('Successful Update', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      body: JSON.stringify({ Night: '999' }),
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const context = {};
    const res = await lambda.handler(event, context);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.pk).toBe('1::FEES');
    expect(body.data.sk).toBe('Fake Feature::Pretend Camping::Party');
    expect(body.data.Night).toBe('999');
  });

  test('Missing Parameters', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping'
        // Missing billingBy: 'Party'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe('Missing Param: billingBy');
  });

  test('Invalid JSON in Request Body', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      body: '{ Night: 999 }', // Invalid JSON
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe('Invalid JSON in request body');
  });

  test('Unauthorized Access', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe('Unauthorized');
  });

  test('Record Not Found', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });

  test('Test for options', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'OPTIONS',
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    };
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
  });

  test('Missing Body', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
  
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe('Invalid JSON in request body');
  });

  test('Body doesnt include required param', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      body: JSON.stringify({ fake: 'Not on list' }),
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe('Missing required fields in body');
  });

  test('Record Not Found', async () => {
    const lambda = require('../PUT/index');
    const event = {
      httpMethod: 'PUT',
      queryStringParameters: {
        ORCS: '99',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Party'
      },
      body: JSON.stringify({ Night: '999' }),
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.error).toBe(`The requested park feature \"Fake Feature\" with activity \"Pretend Camping\" and billing type \"Party\" could not be found in the protected area identified by '99'. Please verify the provided parameters and try again.`);
  });
});