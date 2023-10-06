const AWS = require('aws-sdk');
const { logger } = require('/opt/base');

const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const AWS_REGION = process.env.AWS_REGION || 'ca-central-1';
const STATUS_INDEX_NAME = process.env.STATUS_INDEX_NAME || 'ByStatusOfOrcs';
const LEGALNAME_INDEX_NAME = process.env.STATUS_INDEX_NAME || 'ByLegalName';

const options = {
  region: AWS_REGION
};

if (process.env.IS_OFFLINE) {
  options.endpoint = 'http://localhost:8000';
}

const dynamodb = new AWS.DynamoDB(options);

exports.dynamodb = new AWS.DynamoDB();

// simple way to return a single Item by primary key.
async function getOne(pk, sk) {
  logger.info(`getItem: { pk: ${pk}, sk: ${sk} }`);
  const params = {
    TableName: TABLE_NAME,
    Key: AWS.DynamoDB.Converter.marshall({ pk, sk })
  };
  let item = await dynamodb.getItem(params).promise();
  return AWS.DynamoDB.Converter.unmarshall(item?.Item) || {};
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
    pageData = await dynamodb.query(query).promise();
    data = data.concat(
      pageData.Items.map(item => {
        return AWS.DynamoDB.Converter.unmarshall(item);
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
    pageData = await dynamodb.scan(query).promise();
    data = data.concat(
      pageData.Items.map(item => {
        return AWS.DynamoDB.Converter.unmarshall(item);
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

// TODO: Remove this, it is unused.
async function getConfig() {
  const config = await getOne('config', 'config');
  return AWS.DynamoDB.Converter.unmarshall(config);
}

module.exports = {
  TABLE_NAME,
  AWS_REGION,
  STATUS_INDEX_NAME,
  LEGALNAME_INDEX_NAME,
  dynamodb,
  runQuery,
  runScan,
  getOne,
  getConfig
};
