const { createDB, deleteDB, getHashedText } = require('../../../__tests__/settings');
const { MockData } = require('../../../__tests__/mock_data');
const data = new MockData;
let dbClient;

describe('Create a Fee', () => {
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

  test('Create a Fee', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        service: 'test',
        billBy: 'test',
        feeValue: 777,
        chargeBy: 'night'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
  });

  test('Fail create a Fee, Missing ORCS', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        parkFeature: 'test',
        service: 'test',
        billBy: 'test',
        feeValue: 777,
        chargeBy: 'night'
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

  test('Fail create a Fee, Missing Park Feature ', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        service: 'test',
        billBy: 'test',
        feeValue: 777,
        chargeBy: 'night'
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

  test('Fail create a Fee, Missing Service', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        billBy: 'test',
        feeValue: 777,
        chargeBy: 'night'
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

  test('Fail create a Fee, Missing Billing Method ', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        service: 'test',
        feeValue: 777,
        chargeBy: 'night'
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

  test('Fail create a Fee, Missing Fee Value', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        service: 'test',
        billBy: 'test',
        chargeBy: 'night'
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

  test('Fail create a Fee, Missing charge By', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        service: 'test',
        billBy: 'test',
        feeValue: 777
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

  test('Create a Fee, Fail Not an admin', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {
        ORCS: 3,
        parkFeature: 'test',
        service: 'test',
        billBy: 'test',
        feeValue: 777,
        chargeBy: 'night'
      },
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });

  test('Create a Fee, Fail No params', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'POST',
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(400);
  });

  test('Test for options', async () => {
    const lambda = require('../POST/index');
    const event = {
      httpMethod: 'OPTIONS',
      requestContext: {
        authorizer: {
          isAdmin: false
        }
      }
    }
    const res = await lambda.handler(event, null);
    expect(res.statusCode).toBe(200);
  });

});