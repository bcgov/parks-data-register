const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { handler } = require('../PUT/index'); // Update the path accordingly
const { Settings } = require('luxon');
const oldNow = Settings.now();

const item1 = {
  "pk": "41",
  "sk": "Details",
  "effectiveDate": "1911-03-01",
  "legalName": "Strathcona Park",
  "status": "established",
  "phoneticName": "STRA",
  "displayName": "Strathcona Park",
  "searchTerms": "mount asdf",
  "notes": "Some Notes",
  "updateDate": 'date1'
};

const item2 = { ...item1 };
item2.status = "repealed";

async function insertItem(item) {
  const { REGION, ENDPOINT, TABLE_NAME } = require('../../../../../__tests__/settings');
  const ddb = new DocumentClient({
    region: REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true
  });
  await ddb
    .put({
      TableName: TABLE_NAME,
      Item: item
    })
    .promise();
}

async function removeItem(item) {
  const { REGION, ENDPOINT, TABLE_NAME } = require('../../../../../__tests__/settings');
  const ddb = new DocumentClient({
    region: REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true
  });
  await ddb.delete({
    TableName: TABLE_NAME,
    Key: {
      "pk": item.pk,
      "sk": item.sk
    }
  }).promise();
}

describe('Lambda Handler Tests', () => {
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
      "lastVersionDate": "date1",
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
      pathParameters: {
        "identifier": "41"
      },
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
    await insertItem(item1);
    const body = {
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
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
      pathParameters: {
        "identifier": "41"
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(200);
    await removeItem(item1);
  });

  test('minorUpdate should return a response with status code missing things 400', async () => {
    const body = {
      "orcs": "41",
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "established",
      "searchTerms": "mount asdf"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      pathParameters: {
        "identifier": "41"
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

  test('minorUpdate should fail because of type issues 400', async () => {
    const body = {
      "orcs": "3",
      "lastVersionDate": "date1",
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
      pathParameters: {
        "identifier": "3"
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

  test('Repeal should repeal a protectedArea 200', async () => {
    await insertItem(item1);
    const body = {
      "effectiveDate": "1911-03-01",
      "lastVersionDate": "date1",
      "legalName": "Strathcona Park",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    }

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'repeal'
      },
      pathParameters: {
        "identifier": "41"
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
    expect(payload.data.status).toBe('repealed');
    await removeItem(item1);
  })

  test('Edit should fail if status isnt established 400', async () => {
    await insertItem(item2);
    const body = {
      "effectiveDate": "1911-03-01",
      "lastVersionDate": "date1",
      "legalName": "Strathcona Park",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes"
    }

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minorUpdate'
      },
      pathParameters: {
        "identifier": "41"
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
    await removeItem(item2);
  })

  test('Invalid update type: 400', async () => {
    const body = {
      "orcs": "123",
      "lastVersionDate": "date1",
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
      pathParameters: {
        "identifier": "123"
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

  test('Invalid status: 400', async () => {
    const body = {
      "orcs": "123",
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "aaa",
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
      pathParameters: {
        "identifier": "123"
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
    await insertItem(item1);
    const body = {
      "orcs": "41",
      "lastVersionDate": "date1",
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
      pathParameters: {
        "identifier": "41"
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
    await removeItem(item1);
  });

  test('Payload does not include lastVersionDate, return 400', async () => {
    await insertItem(item1);
    const body = {
      "orcs": "41",
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
        updateType: 'minor'
      },
      pathParameters: {
        "identifier": "41"
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
    const payload = JSON.parse(result.body);
    expect(payload.error).toBe(`Missing required field 'lastVersionDate'`);
    await removeItem(item1);
  });

  
  test('Payload does not include displayName value, return 200', async () => {
    await insertItem(item1);
    const body = {
      "orcs": "41",
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park 2",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "",
      "searchTerms": "mount asdf",
      "notes": "Some Notes 2"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'minor'
      },
      pathParameters: {
        "identifier": "41"
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
    // Display name is overwritten with legalname value
    expect(payload.data.displayName).toBe(`Strathcona Park 2`);
    await removeItem(item1);
  });
});
