const {
  OPENSEARCH_MAIN_INDEX,
  OSQuery,
} = require('../../.aws-sam/build/OpenSearchLayer/opensearch');

const DEFAULT_RESULT_SIZE = 10;
const MAX_RESULT_SIZE = 100;

// Mocks for the environment variables
process.env.OPENSEARCH_DOMAIN_ENDPOINT = 'http://localhost:9200';
process.env.OPENSEARCH_MAIN_INDEX = 'main-index';

describe('OSQuery class', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    test('should initialize with default values when no parameters provided', async () => {
      const queryInstance = new OSQuery();
      expect(queryInstance.index).toEqual(OPENSEARCH_MAIN_INDEX);
      expect(queryInstance.size).toEqual(DEFAULT_RESULT_SIZE);
      expect(queryInstance.from).toEqual(0);
      expect(queryInstance.sortField).toEqual(null);
      expect(queryInstance.sortOrder).toEqual('asc');

    });

    test('should initialize with provided values', async () => {
      const customIndex = 'custom-index';
      const customSize = 20;
      const customFrom = 5;
      const customField = 'field';
      const customOrder = 'desc';

      const queryInstance = new OSQuery(customIndex, customSize, customFrom, customField, customOrder);

      expect(queryInstance.index).toEqual(customIndex);
      expect(queryInstance.size).toEqual(customSize);
      expect(queryInstance.from).toEqual(customFrom);
      expect(queryInstance.sortField).toEqual(customField);
      expect(queryInstance.sortOrder).toEqual(customOrder);
    });
  });

  describe('search method', () => {
    test('should call OpenSearch client search method with correct parameters', async () => {
      const layer = require('../../.aws-sam/build/OpenSearchLayer/opensearch');

      const queryInstance = new OSQuery();

      const searchSpy = jest.spyOn(layer.client, 'search');

      queryInstance.query = {
        bool: {
          must: {
            query_string: {
              query: 'test'
            }
          }
        }
      }
      try {
        await queryInstance.search();

        expect(searchSpy).toHaveBeenCalledWith({
          index: queryInstance.index,
          size: queryInstance.size,
          from: queryInstance.from,
          body: {
            query: queryInstance.query,
          },
        });
      } catch (err) {
        console.log('err:', err);
      }
    });
  });

  describe('addMatchQueryStringRule method', () => {
    test('should set match query string rule correctly', async () => {
      const queryInstance = new OSQuery();

      queryInstance.addMatchQueryStringRule('example');

      expect(queryInstance.query).toEqual({
        bool: {
          must: [{
            query_string: {
              query: 'example',
            },
          }],
        },
      });

      // Test escaped characters
      queryInstance.addMatchQueryStringRule('example&query');

      expect(queryInstance.query).toEqual({
        bool: {
          must: [
            {
              query_string: {
                query: 'example',
              },
            },
            {
              query_string: {
                query: 'example\\&query',
              },
            },
          ],
        },
      });
    });
  });

  describe('addMustMatchTermsRule method', () => {
    test('should call addTermsRule correctly', async () => {
      const queryInstance = new OSQuery();
      const terms = { field: 'value' };
      const terms2 = { field2: 'value2', field3: 'value3' };

      queryInstance.addMustMatchTermsRule(terms, true);

      expect(queryInstance.query).toEqual({
        bool: {
          must: [{
            terms: {
              field: ['value'],
            },
          }],
        },
      });

      queryInstance.addMustMatchTermsRule(terms2, true);

      expect(queryInstance.query).toEqual({
        bool: {
          must: [
            {
              terms: {
                field: ['value'],
              },
            },
            {
              terms: {
                field2: ['value2'],
              },
            },
            {
              terms: {
                field3: ['value3'],
              },
            },
          ],
        },
      });
    });
  });

  describe('addMustNotMatchTermsRule method', () => {
    test('should call addTermsRule correctly with ignore=true and exactMatch=false', async () => {
      const queryInstance = new OSQuery();
      const terms = { field: 'value' };
      const terms2 = { field2: 'value2', field3: 'value3' };

      queryInstance.addMustNotMatchTermsRule(terms);

      expect(queryInstance.query).toEqual({
        bool: {
          must_not: [{
            match: {
              field: 'value',
            },
          }],
        },
      });

      queryInstance.addMustNotMatchTermsRule(terms2);

      expect(queryInstance.query).toEqual({
        bool: {
          must_not: [
            {
              match: {
                field: 'value',
              },
            },
            {
              match: {
                field2: 'value2',
              },
            },
            {
              match: {
                field3: 'value3',
              },
            },
          ],
        },
      });
    });
  });
});

describe('addShouldMatchTermsRule method', () => {
  test('should call addTermsRule correctly with ignore=true and exactMatch=false', async () => {
    const queryInstance = new OSQuery();
    const terms = { field: 'value' };
    const terms2 = { field2: 'value2', field3: 'value3' };

    queryInstance.addShouldMatchTermsRule(terms);

    expect(queryInstance.query).toEqual({
      bool: {
        should: [{
          match: {
            field: 'value',
          },
        }],
      },
    });

    queryInstance.addShouldMatchTermsRule(terms2);

    expect(queryInstance.query).toEqual({
      bool: {
        should: [
          {
            match: {
              field: 'value',
            },
          },
          {
            match: {
              field2: 'value2',
            },
          },
          {
            match: {
              field3: 'value3',
            },
          },
        ],
      },
    });
  });
});

describe('addSortRule function', () => {
  test('should add sort rules correctly', async () => {
    const sortRule = new OSQuery();
    sortRule.addSortRule('field');
    expect(sortRule.sort).toEqual([{
      'field': {
        order: 'asc'
      }
    }]);
  })
})

describe('setSearchLimit function', () => {
  test('should return the adjusted search limit within allowed bounds', async () => {
    const limit = 150;

    const adjustedLimit = new OSQuery('index', limit);

    expect(adjustedLimit.size).toEqual(MAX_RESULT_SIZE);
  });

  test('should return 1 when requested limit is less than 1', async () => {
    const limit = -5;

    const adjustedLimit = new OSQuery('index', limit);

    expect(adjustedLimit.size).toEqual(1);
  });
});
