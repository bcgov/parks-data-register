const { createDB, deleteDB, getHashedText } = require('../../../__tests__/settings');
const { MockData } = require('../../../__tests__/mock_data');

const data = new MockData;
let dbClient;

describe('Delete a Fee', () => {
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

  test('Delete a Fee', async () => {
      const lambda = require('../DELETE/index');
      const getLambda = require('../GET/index');
      const event = {
      httpMethod: 'GET',
      queryStringParameters: {
          ORCS: 1
      },
      requestContext: {
          authorizer: {
          isAdmin: true
          }
      }
      }
      const resGet = await getLambda.handler(event, null);
      const getBody = JSON.parse(resGet.body);
      expect(resGet.statusCode).toBe(200);
      expect(getBody.data.items.length).toBe(1);
      expect(getBody.data.items[0].pk).toBe('1::FEES');
      expect(getBody.data.items[0].sk).toBe('Fake Feature::Pretend Camping::Party');
      const eventDelete = {
          httpMethod: 'DELETE',
          queryStringParameters: {
              ORCS: 1,
              parkFeature: 'Fake Feature',
              service: 'Pretend Camping',
              billingBy: 'Party'
          },
          requestContext: {
              authorizer: {
                  isAdmin: true
              }
          }
      }
      const res = await lambda.handler(eventDelete, null);
      expect(res.statusCode).toBe(200);
      const resGetAfter = await getLambda.handler(event, null);
      const getBodyAfter = JSON.parse(resGetAfter.body);
      expect(resGetAfter.statusCode).toBe(200);
      expect(getBodyAfter.data.items.length).toBe(0);
  });

  test('Fail to Delete a Fee - Missing ORCS', async () => {
      const lambda = require('../DELETE/index');
      const getLambda = require('../GET/index');
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          ORCS: 1
        },
        requestContext: {
          authorizer: {
            isAdmin: true
          }
        }
      }
      const resGet = await getLambda.handler(event, null);
      const getBody = JSON.parse(resGet.body);
      expect(resGet.statusCode).toBe(200);
      expect(getBody.data.items.length).toBe(1);
      expect(getBody.data.items[0].pk).toBe('1::FEES');
      expect(getBody.data.items[0].sk).toBe('Fake Feature::Pretend Camping::Party');
      const eventDelete = {
        httpMethod: 'DELETE',
        queryStringParameters: {
          parkFeature: 'Fake Feature',
          service: 'Pretend Camping',
          billingBy: 'Party'
        },
        requestContext: {
          authorizer: {
            isAdmin: true
          }
        }
      }
      const res = await lambda.handler(eventDelete, null);
      expect(res.statusCode).toBe(400);
      const resGetAfter = await getLambda.handler(event, null);
      const getBodyAfter = JSON.parse(resGetAfter.body);
      expect(resGetAfter.statusCode).toBe(200);
      expect(getBodyAfter.data.items.length).toBe(1);
  });

  test('Fail to Delete a Fee - Not admin', async () => {
      const lambda = require('../DELETE/index');
      const eventDelete = {
          httpMethod: 'DELETE',
          queryStringParameters: {
          ORCS: 1,
          parkFeature: 'Fake Feature',
          service: 'Pretend Camping',
          billingBy: 'Party'
          },
          requestContext: {
              authorizer: {
                  isAdmin: false
              }
          }
      };
      const res = await lambda.handler(eventDelete, null);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toBe('must be admin to delete a fee');
  });

  test('Fail to Delete a Fee - No params', async () => {
  const lambda = require('../DELETE/index');
  const eventDelete = {
      httpMethod: 'DELETE',
      requestContext: {
      authorizer: {
          isAdmin: true
      }
      }
  }
  const res = await lambda.handler(eventDelete, null);
  const body = JSON.parse(res.body);
  expect(res.statusCode).toBe(400);
  expect(body.error).toBe('Missing parameters');
  });

  test('Handle OPTIONS request', async () => {
    const lambda = require('../DELETE/index');
    const event = {
      httpMethod: 'OPTIONS'
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.msg).toBe('Success');
  });
  
  test('Fail to Delete a Fee - DynamoDB Error', async () => {
    const lambda = require('../DELETE/index');
    const eventDelete = {
      httpMethod: 'DELETE',
      queryStringParameters: {
        ORCS: 1,
        parkFeature: 'Fake Feature',
        service: 'Pretend Camping',
        billingBy: 'Party'
      },
      requestContext: {
        authorizer: {
          isAdmin: true
        }
      }
    };
    jest.mock('/opt/dynamodb', () => ({
      deleteItem: jest.fn().mockImplementation(() => {
        throw new Error('DynamoDB Error');
      })
    }));
    const res = await lambda.handler(eventDelete, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(500);
    expect(body.error).toBe('Failed to delete item from DynamoDB');
  });

  test('Empty Request Context', async () => {
    const lambda = require('../DELETE/index');
    const event = {
      httpMethod: 'DELETE',
      queryStringParameters: {
        ORCS: 1,
        parkFeature: 'Fake Feature',
        service: 'Pretend Camping',
        billingBy: 'Party'
      },
      requestContext: {}
    };
    const res = await lambda.handler(event, null);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(403);
    expect(body.error).toBe('Unauthorized');
  });
});
