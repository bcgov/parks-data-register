const { createDB, deleteDB, getHashedText } = require('../../../__tests__/settings');
const { MockData } = require('../../../__tests__/mock_data');
const data = new MockData;
let dbClient;

describe('Specific Fee GET', () => {
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

  test('No query params provided, return all fees (2)', async () => {
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
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.items.length).toBe(2);
  });

  test('Get all Fees for specific ORC', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1'
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
  });

  test('Get all Fees for specific Park Feature', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
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
    expect(body.data.items[0].Night).toBe(10);
  });

  test('Fail to find Fee by Park Feature lack of params', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        parkFeature: 'Fake Feature',
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });

  test('Fail to find Fee by invalid Park Feature', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Fake Feature',
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
    expect(body.data.items.length).toBe(0);
  });

  test('Get all Fees for specific activity', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping'
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
    expect(body.data.items[0].Night).toBe(10);
  });

  test('Fail to find Activity Fee lack of Parameters', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        activity: 'Fake Pretend Camping'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });

  test('Fail to find Activity Fee', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Fake Pretend Camping'
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
    expect(body.data.items.length).toBe(0);
  });
  
  test('Get Fees by Billing Method', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billBy: 'Party'
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
    expect(body.data.items[0].Night).toBe(10);
  });

  test('Fail to find Fee with insufficient parameteres for Billing Method', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        billingBy: 'Big Group Of Friends'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });
  
  test('Fail to find Fee with invalid Billing Method', async () => {
    const lambda = require('../GET/index');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        ORCS: '1',
        parkFeature: 'Fake Feature',
        activity: 'Pretend Camping',
        billingBy: 'Big Group Of Friends'
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
    expect(body.data.items.length).toBe(0);
  });
});