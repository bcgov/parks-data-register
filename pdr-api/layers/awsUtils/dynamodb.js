const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { logger } = require('/opt/base');

const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const AWS_REGION = process.env.AWS_REGION || 'ca-central-1';
const AUDIT_TABLE_NAME = process.env.TABLE_NAME || "Audit";
const STATUS_INDEX_NAME = process.env.STATUS_INDEX_NAME || "ByStatusOfOrcs";
const LEGALNAME_INDEX_NAME = process.env.STATUS_INDEX_NAME || "ByLegalName";

const TRANSACTION_MAX_SIZE = 100;

const options = {
  region: AWS_REGION
};
if (process.env.IS_OFFLINE === 'true') {
  // Env vars evaluate as strings
  options.endpoint = process.env.DYNAMODB_ENDPOINT_URL || 'http://localhost:8000';
}

const dynamodb = new DynamoDB(options);

// simple way to return a single Item by primary key.
async function getOne(pk, sk) {
  logger.info(`getItem: { pk: ${pk}, sk: ${sk} }`);
  const params = {
    TableName: TABLE_NAME,
    Key: marshall({ pk, sk }),
  };
  let item = await dynamodb.getItem(params);
  if (item?.Item) {
    return unmarshall(item.Item);
  }
  return {};
}

async function runQuery(query, limit = null, lastEvaluatedKey = null, paginated = true) {
  logger.info('query:', query);
  let data = [];
  let pageData = [];
  let page = 0;

  // If last evaluated key provided, start at the key.
  if (lastEvaluatedKey) {
    pageData['LastEvaluatedKey'] = lastEvaluatedKey;
  }

  do {
    page++;
    if (pageData?.LastEvaluatedKey) {
      query.ExclusiveStartKey = pageData.LastEvaluatedKey;
    }
    // If limit provided, add it to the query params.
    if (limit && paginated) {
      query.Limit = limit;
    }
    pageData = await dynamodb.query(query);
    data = data.concat(
      pageData.Items.map(item => {
        return unmarshall(item);
      })
    );
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.info(`Page ${page} contains ${pageData.Items.length} additional query results...`);
    }
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.info(`Query result pages: ${page}, total returned items: ${data.length}`);
  if (paginated) {
    return {
      lastEvaluatedKey: pageData.LastEvaluatedKey,
      items: data
    };
  } else {
    return {
      items: data
    };
  }
}

async function runScan(query, limit = null, lastEvaluatedKey = null, paginated = true) {
  logger.info('query:', query);
  let data = [];
  let pageData = [];
  let page = 0;

  // If last evaluated key provided, start at the key.
  if (lastEvaluatedKey) {
    pageData['LastEvaluatedKey'] = lastEvaluatedKey;
  }

  do {
    page++;
    if (pageData?.LastEvaluatedKey) {
      query.ExclusiveStartKey = pageData.LastEvaluatedKey;
    }
    // If limit provided, add it to the query params.
    if (limit && paginated) {
      query.Limit = limit;
    }
    pageData = await dynamodb.scan(query);
    data = data.concat(
      pageData.Items.map(item => {
        return unmarshall(item);
      })
    );
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.info(`Page ${page} contains ${pageData.Items.length} additional scan results...`);
    }
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.info(`Scan result pages: ${page}, total returned items: ${data.length}`);
  if (paginated) {
    return {
      lastEvaluatedKey: pageData.LastEvaluatedKey,
      items: data
    };
  } else {
    return {
      items: data
    };
  }
}

async function putItem(obj, tableName = TABLE_NAME) {
  let putObj = {
    TableName: tableName,
    Item: obj,
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
  };

  await dynamodb.putItem(putObj);
}

async function batchWriteData(dataToInsert, chunkSize, tableName) {
  logger.info("dataToInsert");
  logger.debug(JSON.stringify(dataToInsert));

  const dataChunks = chunkArray(dataToInsert, chunkSize);

  logger.debug(JSON.stringify(dataChunks));

  for (let index = 0; index < dataChunks.length; index++) {
    const chunk = dataChunks[index];

    const writeRequests = chunk.map(item => ({
      PutRequest: {
        Item: item
      }
    }));

    logger.debug(JSON.stringify(writeRequests));

    const params = {
      RequestItems: {
        [tableName]: writeRequests
      }
    };

    try {
      logger.debug(JSON.stringify(params));
      const data = await dynamodb.batchWriteItem(params);
      logger.info(`BatchWriteItem response for chunk ${index}:`, data);
    } catch (err) {
      logger.error(`Error batch writing items in chunk ${index}:`, err);
    }
  }
}

// Assume data is already in Dynamo Json format
// Function to chunk the data into smaller arrays
function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * Asynchronously batches and transacts data into DynamoDB.
 * @async
 * @param {Array<Object>} data - The array of objects to be transacted into DynamoDB.
 * If you want the transaction action to differ from the one provided in the `action` argument,
 * you can provide your data as {action: ('Put', 'Update', 'Delete', 'ConditionExpression'), data: <object> }.
 * This allows you to perform more than 1 type of action per transaction.
 * @param {string} [action='Put'] - The default action to perform if not specified for each item ('Put', 'Update', 'Delete', 'ConditionExpression').
 * @returns {Promise<boolean>} - A Promise that resolves to true if the batch transact operation succeeds.
 */
async function batchTransactData(data, action = 'Put') {

  const dataChunks = chunkArray(data, TRANSACTION_MAX_SIZE);

  logger.debug(JSON.stringify(data));
  logger.debug(JSON.stringify(dataChunks));
  logger.info('Data items:', data.length);
  logger.info('Transactions:', dataChunks.length);

  try {
    for (let index = 0; index < dataChunks.length; index++) {
      const chunk = dataChunks[index];

      const TransactItems = chunk.map(item => {
        let op = item?.action || action;
        switch (op) {
          case 'ConditionExpression':
            return { ConditionExpression: item?.data || item };
          case 'Update':
            return { Update: item?.data || item };
          case 'Delete':
            return { Delete: item?.data || item };
          case 'Put':
          default:
            return { Put: item?.data || item };
        }
      });

      logger.debug(JSON.stringify(TransactItems));

      const data = await dynamodb.transactWriteItems({ TransactItems: TransactItems });
      logger.debug(`BatchWriteItem response for chunk ${index}:`, data);
    }
  } catch (error) {
    logger.error(`Error batch writing items:`, error);
    throw error;
  }
  return true;
}

/**
 * Asynchronously sets the status for a list of sites.
 *
 * @async
 * @param {Array<string>} sites - An array of site identifiers. Each identifier should be in the form of '<ProtectedAreaID>:Site:<SiteID>'.
 * @param {string} status - The status to be set for the sites.
 * @returns {Promise<Object>} A promise that resolves with the new site object.
 */
async function setSiteStatus(sites, status) {
  // Takes the form of [<ProtectedAreaID>:Site::<SiteID>]
  // Sets the site status and returns the new object
  return Promise.resolve();
}


module.exports = {
  AUDIT_TABLE_NAME,
  AWS_REGION,
  LEGALNAME_INDEX_NAME,
  STATUS_INDEX_NAME,
  TABLE_NAME,
  batchTransactData,
  batchWriteData,
  dynamodb,
  getOne,
  putItem,
  runQuery,
  runScan,
  setSiteStatus
};
