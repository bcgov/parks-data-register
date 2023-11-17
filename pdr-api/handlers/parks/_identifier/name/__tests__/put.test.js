describe('Lambda Handler Tests', () => {
  const { DocumentClient } = require('aws-sdk/clients/dynamodb');
  const { handler } = require('../PUT/index'); // Update the path accordingly
  const { Settings } = require('luxon');
  const oldNow = Settings.now();

  const IDIR_TEST_USER = 'IDIR_USER_TODO';

  beforeAll(() => {
    Settings.now = () => new Date(2018, 4, 25).valueOf();
  })

  afterAll(() => {
    Settings.now = () => new Date(oldNow).valueOf();
  });

  test('validateRequest should throw an error for invalid payload', async () => {
    const invalidPayload = { effectiveDate: '2023-01-01' };

    const response = await handler(invalidPayload);
    expect(response.statusCode).toBe(400);
  });

  test('minorUpdate should return a response with status code 400', async () => {
    const body = { orcs: 'someId', effectiveDate: '2023-01-01' };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
  });

  test('minorUpdate should return a response with status code 403', async () => {
    const body = {
      "orcs": "41",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      requestContext: {
        authorizer: {
          isAdmin: false,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(403);
  });

  test('minorUpdate should return a response with status code 200', async () => {
    const body = {
      "orcs": "41",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(200);
  });

  test('minorUpdate should fail because of type issues 400', async () => {
    const body = {
      "orcs": "3",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": 0, // This is wrong
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
  });

  test('Invalid update type: 400', async () => {
    const body = {
      "orcs": "123",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'somethingWrong'
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
  });

  test('nameChange should return a response with status code 200', async () => {
    // Put the document we want to update first.
    const { REGION, ENDPOINT, TABLE_NAME } = require('../../../../../__tests__/settings');
    const ddb = new DocumentClient({
      region: REGION,
      endpoint: ENDPOINT,
      convertEmptyValues: true
    });
    await ddb
      .put({
        TableName: TABLE_NAME,
        Item: {
          "pk": "111",
          "sk": "Details",
          "effectiveDate": "1911-03-01",
          "legalName": "Strathcona Park",
          "status": "established",
          "phoneticName": "STRA",
          "displayName": "Strathcona Park",
          "searchTerms": "mount asdf",
          "notes": "Some Notes"
        }
      })
      .promise();

    const body = {
      "orcs": "111",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park 2",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park 2",
      "searchTerms": "mount asdf",
      "notes": "Some Notes 2"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'major'
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(200);
    const payload = JSON.parse(result.body);
    expect(payload.data.legalName).toBe('Strathcona Park 2');
    expect(payload.data.lastModifiedBy).toBe(IDIR_TEST_USER)
  });
});
