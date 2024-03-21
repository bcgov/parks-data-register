
const { defaultProvider } = require('@aws-sdk/credential-provider-node'); // V3 SDK.
const { Client } = require('@opensearch-project/opensearch');
const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');

// Import necessary libraries and modules
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT || 'http://localhost:9200';
const OPENSEARCH_MAIN_INDEX = process.env.OPENSEARCH_MAIN_INDEX || 'main-index';
const OPENSEARCH_AUDIT_INDEX = process.env.OPENSEARCH_MAIN_INDEX || 'audit-index';
const OPENSEARCH_DEFAULT_SORT_ORDER = 'asc'; // asc or desc
const DEFAULT_RESULT_SIZE = 10;
const MAX_RESULT_SIZE = 100;
// Query parameters that should not be used as keyable search terms
const nonKeyableTerms = [
  'text',
  'startFrom',
  'limit',
  'sortField',
  'sortOrder',
]

let client = new Client({
  ...AwsSigv4Signer({
    region: 'ca-central-1',
    service: 'es',
    getCredentials: () => {
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    }
  }),
  node: OPENSEARCH_DOMAIN_ENDPOINT // OpenSearch domain URL
});

// For offline development
if (process.env.IS_OFFLINE === 'true') {
  client = new Client({
    node: OPENSEARCH_DOMAIN_ENDPOINT,
    ssl: {
      rejectUnauthorized: false
    }
  })
}

/**
 * A class representing an OpenSearch query builder.
 *
 * @class
 */
class OSQuery {
  /**
   * Creates an instance of OSQuery.
   *
   * @constructor
   * @param {string} [index=OPENSEARCH_MAIN_INDEX] - The index to search.
   * @param {number} [size=setSearchLimit(size)] - The maximum number of results to return.
   * @param {number} [from=0] - The starting index for the results.
   * @param {number} [sortField=null] - A field to sort the results by.
   * @param {number} [sortOrder=OPENSEARCH_DEFAULT_SORT_ORDER] - The sorting method to use when sorting results.
   */
  constructor(index, size, from, sortField, sortOrder) {
    /**
     * The query object representing the OpenSearch query.
     * @type {Object}
     */
    this.query = {};
    /**
     * The index to search.
     * @type {string}
     */
    this.index = index || OPENSEARCH_MAIN_INDEX;
    /**
     * The maximum number of results to return.
     * @type {number}
     */
    this.size = setSearchLimit(size);
    /**
     * The starting index for the results.
     * @type {number}
     */
    this.from = from || 0;
    this.sortField = sortField || null;
    this.sortOrder = sortOrder || OPENSEARCH_DEFAULT_SORT_ORDER;
        /**
     * The sort object for sorting the results.
     * @type {Object}
     */
    this.sort = null;
    this.request = null;
    this.initSortQuery();
  }

  /**
   * Performs an asynchronous search using the configured query parameters.
   *
   * @async
   * @returns {Promise<Object>} A Promise that resolves to the search result.
   */
  async search() {
    // Match at least 1 OR condition
    if (this.query?.bool?.should) {
      this.query.bool['minimum_should_match'] = 1;
    }
    this.request = {
      index: this.index,
      size: this.size,
      from: this.from,
      body: {
        query: this.query,
      }
    }
    // Add sort to body if provided
    if (this.sort) {
      this.request.body['sort'] = this.sort;
    }
    return await client.search(this.request);
  }

  initSortQuery() {
    if (this.sortField) {
      this.addSortRule(this.sortField, this.sortOrder);
    } else {
      this.sort = null;
    }
  }

  /**
   * Adds a match query string rule to the OpenSearch query.
   *
   * @param {string} string - The string to match in the query.
   */
  addMatchQueryStringRule(string) {
    setNestedValue(
      this.query,
      ['bool', 'must'],
      {
        query_string: {
          query: escapeOpenSearchQuery(string)
        }
      }
    )
  }

  /**
   * Adds must match terms rule to the OpenSearch query (logical `AND`).
   *
   * @param {Array} terms - An array of terms to match in the query.
   * @param {Boolean} exactMatch - If true, term must match exactly to return a hit. Default false. 
   */
  addMustMatchTermsRule(terms, exactMatch = false) {
    addTermsRule(this.query, terms, 'must', exactMatch)
  }

  /**
   * Adds must not match terms rule to the OpenSearch query (logical `NOT`).
   *
   * @param {Array} terms - An array of terms to exclude from the query.
   * @param {Boolean} exactMatch - If true, term must match exactly to ignore a hit. Default false. 
   */
  addMustNotMatchTermsRule(terms, exactMatch = false) {
    addTermsRule(this.query, terms, 'must_not', exactMatch)
  }

  /**
 * Adds should match terms rule to the OpenSearch query (logical `OR`).
 *
 * @param {Array} terms - An array of terms to exclude from the query.
 * @param {Boolean} exactMatch - If true, term must match exactly to ignore a hit. Default false. 
 */
  addShouldMatchTermsRule(terms, exactMatch = false) {
    addTermsRule(this.query, terms, 'should', exactMatch)
  }

  /**
   * Adds sort rule to the OpenSearch query. Only single field sorting is currently supported
   *
   * @param {String} field - The field to order by
   * @param {String} order - Sort order ('asc' or 'desc').
   */
  addSortRule(field, order = OPENSEARCH_DEFAULT_SORT_ORDER) {
    this.sort = [{
      [field]: {
        order: order
      }
    }]
  }

}

/**
 * Adds terms rule to the OpenSearch query.
 *
 * @param {Object} query - The OpenSearch query object to which the terms rule will be added.
 * @param {Object} terms - An object representing the terms to be matched in the query.
 * @param {boolean} [ignore=false] - If true, adds terms as "must_not" in the query; otherwise, adds as "must".
 * @param {boolean} [exactMatch=true] - If true, uses "terms" in the match; otherwise, uses "match".
 */
function addTermsRule(query, terms, clause = 'must', exactMatch = true) {
  let match = exactMatch ? 'terms' : 'match';
  for (const term of Object.keys(terms)) {
    let value = terms[term];
    // determine value type
    switch (typeof terms[term]) {
      case 'boolean':
        match = 'terms';
        value = [value];
        break;
      default:
        value = value.toLowerCase();
        if (exactMatch) {
          value = value.split(',')
        }
        break;
    }
    setNestedValue(
      query,
      ['bool', clause],
      {
        [match]: {
          [term]: value
        }
      }
    )
  }
}

/**
 * Sets a nested value in an object based on an array of keys.
 *
 * @param {Object} root - The root object in which the nested value will be set.
 * @param {Array} keys - An array of keys representing the path to the nested value.
 * @param {any} value - The value to be set at the nested path.
 * @param {boolean} [append=true] - If true, appends the value to an existing array; otherwise, replaces the value.
 */
function setNestedValue(root, keys, value, append = true) {
  if (keys.length === 1) {
    if (append) {
      if (root?.[keys[0]]?.length) {
        root[keys[0]].push(value);
      } else {
        root[keys[0]] = [value];
      }
    } else {
      root[keys[0]] = value;
    }
  } else {
    root[keys[0]] = root[keys[0]] || {};
    setNestedValue(root[keys[0]], keys.slice(1), value);
  }
}

/**
 * Escapes special characters in an OpenSearch query string.
 *
 * @param {string} input - The input string to be escaped.
 * @returns {string} The escaped OpenSearch query string.
 */
function escapeOpenSearchQuery(input) {
  // Define a regular expression pattern for reserved characters
  const pattern = /([-&|!(){}[\]^"~*?:\/+])/g;
  // Use the replace method with a callback function to handle replacements
  const escapedQuery = input.replace(pattern, (match, p1) => `\\${p1}`);
  return escapedQuery;
}

/**
 * Sets the search limit, ensuring it falls within the specified bounds.
 *
 * @param {number} [limit=DEFAULT_RESULT_SIZE] - The requested limit for search results.
 * @returns {number} The adjusted search limit within the allowed bounds.
 */
function setSearchLimit(limit = DEFAULT_RESULT_SIZE) {
  let requestedLimit = limit;
  if (requestedLimit < 1) {
    requestedLimit = 1;
  }
  if (requestedLimit > MAX_RESULT_SIZE) {
    requestedLimit = MAX_RESULT_SIZE
  }
  return requestedLimit;
}

module.exports = {
  OPENSEARCH_DOMAIN_ENDPOINT,
  OPENSEARCH_MAIN_INDEX,
  OPENSEARCH_AUDIT_INDEX,
  nonKeyableTerms,
  client,
  OSQuery
}