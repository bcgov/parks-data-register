const { createDB, deleteDB, getOneDB, getHashedText, putDB } = require('../../__tests__/settings');
const { MockData } = require('../../__tests__/mock_data');
const { batchTransactData } = require('/opt/dynamodb');
const {
  SITE_MAIN_SK,
  MAJOR_UPDATE_TYPE,
  MINOR_UPDATE_TYPE,
  REPEAL_UPDATE_TYPE,
} = require('/opt/data-constants');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const data = new MockData;
let dbClient;

describe('Sites Layer Tests', () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    const hash = getHashedText('Sites Layer Tests');
    process.env.TABLE_NAME = hash;
    dbClient = await createDB([
      data.mockCurrentParkName1,
      data.mockCurrentParkName2,
      data.mockOldParkName1,
      data.mockParkSite1
    ], hash);
  });

  afterEach(async () => {
    await deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV; // Restore old environment
  });

  test('Get sites for protected area', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    const records = await layer.getSitesForProtectedArea('1');
    expect(records.items.length).toEqual(1);
    expect(records.items[0].sk).toEqual('Site::1');
  });
});

describe('Validate Sites PUT Request', () => {
  const OLD_ENV = process.env;
  let tableName = '';
  beforeEach(async () => {
    jest.resetModules();
    tableName = getHashedText('Validate Sites PUT Request');
    process.env.TABLE_NAME = tableName;
    dbClient = await createDB(null, tableName);
  });

  afterEach(async () => {
    await deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV; // Restore old environment
  });

  test('Throws error if empty post body', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    try {
      expect(await layer.validatePutRequest('1', {}, 'minor')).toThrow();
    } catch (error) {
      expect(error.message).toBe('Empty request body.');
    }
  });

  test('Throws error if site does not exist', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    try {
      expect(await layer.validatePutRequest('X', { arg1: 'arg1' }, 'minor')).toThrow();
    } catch (error) {
      expect(error.message).toBe('Site not found.');
    }
  });

  test('Throws error if trying to repeal park that is already repealed', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockRepealSite3, tableName);
    try {
      expect(await layer.validatePutRequest('1::Site::3', { arg1: 'arg1' }, REPEAL_UPDATE_TYPE)).toThrow();
    } catch (error) {
      expect(error.message).toBe('Forbidden update action.');
    }
    try {
      expect(await layer.validatePutRequest('1::Site::3', { arg1: 'arg1' }, MAJOR_UPDATE_TYPE)).toThrow();
    } catch (error) {
      expect(error.message).toBe('Forbidden update action.');
    }
  });

  test('Throws error if invalid updateType provided', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    const invalidUpdateType = 'invalidUpdateType';
    try {
      expect(await layer.validatePutRequest('1::Site::1', { arg1: 'arg1' }, invalidUpdateType)).toThrow();
    } catch (error) {
      expect(error.message).toBe(`'${invalidUpdateType}' is not a valid update type.`);
    }
  });

  test('Throws error if mandatory fields were not provided', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    // Minor
    try {
      expect(await layer.validatePutRequest('1::Site::1', { lastVersionDate: new Date() }, MINOR_UPDATE_TYPE)).toThrow();
    } catch (error) {
      expect(error.message).toBe('Missing mandatory fields.');
    }
    // Major
    try {
      expect(await layer.validatePutRequest('1::Site::1', { lastVersionDate: new Date(), effectiveDate: new Date() }, MAJOR_UPDATE_TYPE)).toThrow();
    } catch (error) {
      expect(error.message).toBe('Missing mandatory fields.');
    }
  });

  test('Throws if the new legal name in a major update is not different from the old legal name', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    try {
      expect(await layer.validatePutRequest(
        '1::Site::1',
        {
          lastVersionDate: new Date(),
          effectiveDate: new Date(),
          legalName: data.mockCurrentSite1.legalName
        },
        layer.MAJOR_UPDATE_TYPE
      )).toThrow();
    } catch (error) {
      expect(error.message).toBe('Invalid mandatory field.');
    }
  });

  test('Removes all but notes field from body if repealing', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    let body = {
      lastVersionDate: 'date1',
      effectiveDate: 'date2',
      legalName: 'legalName',
      displayName: 'displayName',
      phoneticName: 'phoneticName',
      notes: 'notes'
    };
    expect(await layer.validatePutRequest(
      '1::Site::1',
      body,
      REPEAL_UPDATE_TYPE
    )).toBeTruthy();
    expect(body).toEqual({
      lastVersionDate: 'date1',
      effectiveDate: 'date2',
      notes: 'notes'
    });
  });

  test('Accepts valid requests', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    const newDisplayName = 'newDisplayName';
    const newNotes = 'newNotes';
    const newLegalName = 'legalName';
    // Minor
    expect(await layer.validatePutRequest(
      '1::Site::1',
      {
        lastVersionDate: new Date(),
        effectiveDate: new Date(),
        displayName: newDisplayName,
        newNotes: newNotes
      },
      MINOR_UPDATE_TYPE
    )).toBeTruthy();
    // Major
    expect(await layer.validatePutRequest(
      '1::Site::1',
      {
        lastVersionDate: new Date(),
        effectiveDate: new Date(),
        displayName: newDisplayName,
        newNotes: newNotes,
        legalName: newLegalName
      },
      MAJOR_UPDATE_TYPE
    )).toBeTruthy();
    // Repeal
    expect(await layer.validatePutRequest(
      '1::Site::1',
      {
        lastVersionDate: new Date(),
        effectiveDate: new Date(),
        displayName: newDisplayName,
        newNotes: newNotes,
        legalName: newLegalName
      },
      REPEAL_UPDATE_TYPE
    )).toBeTruthy();
  });
});

describe('Build Sites PUT Objects', () => {
  const OLD_ENV = process.env;
  let tableName = '';
  beforeEach(async () => {
    jest.resetModules();
    tableName = getHashedText('Validate Sites PUT Request');
    process.env.TABLE_NAME = tableName;
    dbClient = await createDB(null, tableName);
  });

  afterEach(async () => {
    await deleteDB(process.env.TABLE_NAME);
    process.env = OLD_ENV; // Restore old environment
  });

  test('Throws an error if invalid site identifier provided.', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    try {
      expect(await layer.createPASiteUpdate('bad', 'displayName')).toThrow();
    } catch (error) {
      expect(error.message).toBe('Malformed site identifier.');
    }
  });

  test('Builds the object for the protected area site update', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockParkSite1, tableName);
    const res = await layer.createPASiteUpdate('1::Site::1', 'newSiteName');
    delete res.TableName;
    expect(res).toEqual({
      Key: { pk: { S: '1' }, sk: { S: 'Site::1' } },
      UpdateExpression: 'SET displayName = :displayName',
      ExpressionAttributeValues: { ':displayName': { S: 'newSiteName' } },
      ConditionExpression: 'attribute_exists(pk)'
    });
  });

  test('Builds the changelog object for the site update', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    const res = await layer.createChangeLogPut(
      '1::Site::1',
      {
        lastVersionDate: 'lastVersionDate',
        effectiveDate: 'effectiveDate',
        legalName: 'newLegalName'
      },
      'user1',
      'updateDate',
      'established'
    );
    const resultData = unmarshall(res.Item);
    expect(resultData.newLegalName).toEqual('newLegalName');
    expect(resultData.updateDate).toEqual('updateDate');
    expect(resultData.lastModifiedBy).toEqual('user1');
    expect(resultData.status).toEqual('historical');
    expect(resultData.legalNameChanged).toBeTruthy();
    expect(resultData.statusChanged).toBeFalsy();
  });

  test('Builds the transaction for a site name put', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    await putDB(data.mockCurrentSite1, tableName);
    await putDB(data.mockParkSite1, tableName);
    const lastVersionDate = data.mockCurrentSite1.lastVersionDate;
    // Minor
    const res1 = await layer.createSitePutTransaction(
      '1::Site::1',
      {
        lastVersionDate: lastVersionDate,
        effectiveDate: 'effectiveDate',
        legalName: 'newLegalName'
      },
      MINOR_UPDATE_TYPE,
      'user1',
      'updateDate',
    );
    expect(res1.length).toEqual(1);
    // Major
    const res2 = await layer.createSitePutTransaction(
      '1::Site::1',
      {
        lastVersionDate: lastVersionDate,
        effectiveDate: 'effectiveDate',
        legalName: 'newLegalName2',
        displayName: 'newDisplayName'
      },
      MAJOR_UPDATE_TYPE,
      'user1',
      lastVersionDate,
    );
    expect(res2.length).toEqual(3);
    // Repeal
    const res3 = await layer.createSitePutTransaction(
      '1::Site::1',
      {
        lastVersionDate: lastVersionDate,
        effectiveDate: 'effectiveDate',
        legalName: 'newLegalName2',
      },
      REPEAL_UPDATE_TYPE,
      'user1',
      lastVersionDate,
    );
    expect(res3.length).toEqual(2);
    // Minor edit on a repeal
    const res4 = await layer.createSitePutTransaction(
      '1::Site::1',
      {
        lastVersionDate: lastVersionDate,
        effectiveDate: 'effectiveDate',
        notes: 'newNotes'
      },
      layer.MINOR_UPDATE_TYPE,
      'user2',
      lastVersionDate,
    );
    expect(res4.length).toEqual(1);
  });

  test('Can minor edit a repealed site name', async () => {
    const layer = require('../../.aws-sam/build/DataUtilsLayer/siteUtils');
    const repealedPark = { ...data.mockCurrentSite1, ...{ status: layer.REPEALED_STATE } };
    await putDB(repealedPark, tableName);
    await putDB(data.mockParkSite1, tableName);
    const lastVersionDate = data.mockCurrentSite1.lastVersionDate;
    const res = await layer.createSitePutTransaction(
      '1::Site::1',
      {
        lastVersionDate: lastVersionDate,
        effectiveDate: 'effectiveDate',
        notes: 'newNotes'
      },
      MINOR_UPDATE_TYPE,
      'user2',
      lastVersionDate,
    );
    await batchTransactData(res);
    let finalObj = await getOneDB('1::Site::1', SITE_MAIN_SK, tableName);
    expect(finalObj.status).toEqual(layer.REPEALED_STATE);
    expect(finalObj.notes).toEqual('newNotes');
    expect(finalObj.lastModifiedBy).toEqual('user2');
  });

});