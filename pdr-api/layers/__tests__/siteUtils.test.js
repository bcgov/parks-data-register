const { createDB, deleteDB, getHashedText } = require('../../__tests__/settings');
const { MockData } = require('../../__tests__/mock_data');
const AWS = require('aws-sdk');

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


})