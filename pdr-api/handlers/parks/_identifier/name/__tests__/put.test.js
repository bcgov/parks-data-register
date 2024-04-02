const { Settings } = require('luxon');
const oldNow = Settings.now();
const { marshall } = require('@aws-sdk/util-dynamodb');
const { createDB, deleteDB, getHashedText } = require('../../../../../__tests__/settings');

let item1 = {
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
let ddb;
async function insertItem(item, tableName) {
  await ddb
    .putItem({
      TableName: tableName,
      Item: marshall(item)
    });
}

async function removeItem(item, tableName) {
  await ddb.deleteItem({
    TableName: tableName,
    Key: {
      "pk": marshall(item.pk),
      "sk": marshall(item.sk)
    }
  });
}

describe('Lambda Handler Tests', () => {
  const OLD_ENV = process.env;
  const IDIR_TEST_USER = 'IDIR_USER_TODO';
  beforeAll(async () => {
    Settings.now = () => new Date(2018, 4, 25).valueOf();
    const hash = getHashedText('Lambda Handler Tests');
    process.env.TABLE_NAME = hash;
    ddb = await createDB(null, hash);
  }, 100000)

  afterAll(async () => {
    await deleteDB(process.env.TABLE_NAME);
    Settings.now = () => new Date(oldNow).valueOf();
    process.env = OLD_ENV; // Restore old environment
  }, 100000);

  it('validateRequest should throw an error for invalid payload', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    const invalidPayload = { effectiveDate: '2023-01-01' };

    const response = await handler(invalidPayload);
    expect(response.statusCode).toBe(400);
  });

  it('minorUpdate should return a response with status code 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
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

  it('minorUpdate should return a response with status code 403', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    const body = {
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
    };

    const result = await handler({
      body: JSON.stringify(body),
      pathParameters: {
        "identifier": item1.pk
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

  it('minorUpdate should return a response with status code 200', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    await insertItem(item1, process.env.TABLE_NAME);
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
        "identifier": item1.pk
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(200);
    await removeItem(item1, process.env.TABLE_NAME);
  });

  it('minorUpdate should return a response with status code missing things 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    const body = {
      "orcs": "41",
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
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

  it('minorUpdate should fail because of type issues 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    const body = {
      "orcs": "3",
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

  it('Repeal should repeal a protectedArea 200', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item1.pk = "242";
    await insertItem(item1, process.env.TABLE_NAME);
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
        "identifier": item1.pk
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });

    expect(result.statusCode).toBe(200);
    console.log(result)
    const payload = JSON.parse(result.body);
    expect(payload.data.status).toBe('repealed');
    await removeItem(item1, process.env.TABLE_NAME);
  })

  it('Edit should fail if status isnt established 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item2.pk = "241";
    await insertItem(item2, process.env.TABLE_NAME);
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
        "identifier": item2.pk
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
    await removeItem(item2, process.env.TABLE_NAME);
  })

  it('Invalid update type: 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
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

  it('Invalid status: 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
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

  it('nameChange should return a response with status code 200', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item1.pk = "243";
    await insertItem(item1, process.env.TABLE_NAME);
    const body = {
      "orcs": item1.pk,
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
        "identifier": item1.pk
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
    await removeItem(item1, process.env.TABLE_NAME);
  });

  it('Payload does not include lastVersionDate, return 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item1.pk = "244";
    await insertItem(item1, process.env.TABLE_NAME);
    const body = {
      "orcs": item1.pk,
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
        "identifier": item1.pk
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
    await removeItem(item1, process.env.TABLE_NAME);
  });

  it('Major change does not include changed legalName, return 400', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item1.pk = "245";
    await insertItem(item1, process.env.TABLE_NAME);
    const body = {
      "orcs": item1.pk,
      "lastVersionDate": "date1",
      "effectiveDate": "1911-03-01",
      "legalName": "Strathcona Park",
      "status": "established",
      "phoneticName": "STRA",
      "displayName": "Strathcona Park",
      "searchTerms": "mount asdf",
      "notes": "Some Notes 2"
    };

    const result = await handler({
      body: JSON.stringify(body),
      queryStringParameters: {
        updateType: 'major'
      },
      pathParameters: {
        "identifier": item1.pk
      },
      requestContext: {
        authorizer: {
          isAdmin: true,
          userID: IDIR_TEST_USER
        }
      }
    });
    expect(result.statusCode).toBe(400);
    await removeItem(item1, process.env.TABLE_NAME);
  });


  it('Payload does not include displayName value, return 200', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    item1.pk = "246";
    await insertItem(item1, process.env.TABLE_NAME);
    const body = {
      "orcs": item1.pk,
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
        "identifier": item1.pk
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
    await removeItem(item1, process.env.TABLE_NAME);
  });

  it('Expected behaviour on field absence', async () => {
    const { handler } = require('../PUT/index'); // Update the path accordingly
    const requests = [
      {
        body: {
          "effectiveDate": "1911-03-01",
        },
        updateType: 'minor',
        expectCode: 400
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
        },
        updateType: 'minor',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
        },
        updateType: 'major',
        expectCode: 400
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "wrongField": ""
        },
        updateType: 'minor',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "name change",
          "wrongField": ""
        },
        updateType: 'major',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "wrongField": "badvalue"
        },
        updateType: 'minor',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "new name",
          "wrongField": "badvalue"
        },
        updateType: 'major',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "",
        },
        updateType: 'major',
        expectCode: 400
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "",
        },
        updateType: 'repeal',
        expectCode: 200
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "",
        },
        updateType: 'minor',
        expectCode: 400
      },
      {
        body: {
          "lastVersionDate": "date1",
          "effectiveDate": "1911-03-01",
          "legalName": "Name",
          "displayName": ""
        },
        updateType: 'minor',
        expectCode: 200
      },
    ];
    for (const request of requests) {
      item1.pk = "247";
      await insertItem(item1, process.env.TABLE_NAME);
      const result = await handler({
        body: JSON.stringify(request.body),
        queryStringParameters: {
          updateType: request.updateType
        },
        pathParameters: {
          "identifier": item1.pk
        },
        requestContext: {
          authorizer: {
            isAdmin: true,
            userID: IDIR_TEST_USER
          }
        }
      })
      expect(result.statusCode).toBe(request.expectCode);
      await removeItem(item1, process.env.TABLE_NAME);
    }
  });
});
