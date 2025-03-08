const { runQuery, runScan, TABLE_NAME} = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');
const WITH_BILLING = 'withBilling';
const BY_ACTIVITY = 'byActivity';
const BY_PARK_FEATURE = 'byparkFeature';
const BY_ORCS = 'byORCS';
const INSUFFICIENT_PARAMS = 'insufficientParams';

exports.handler = async (event, context) => {

  logger.debug('Get all fees for specific park', event);
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    console.log("THIS IS THE EVENT: ", event);
    const queryParams = event.queryStringParameters;
    const queryType = getQueryType(queryParams);
    let query;
    if(queryParams){
      switch (queryType) {
        case WITH_BILLING:
          query = queryFeeWithBilling(queryParams);
          break;
        case BY_ACTIVITY:
          query = queryFeeByActivity(queryParams);
          break;
        case BY_PARK_FEATURE:
          query = queryFeeByParkFeature(queryParams);
          break;
        case BY_ORCS:
          query = queryFeeByORCS(queryParams);
          break;
        default:
          throw {
            code: 400,
            error: 'Insufficient parameters.',
            msg: `Missing required query parameter: 'ORCS'`
          };
      }
      const res = await runQuery(query);
      return sendResponse(200, res, 'Success', null, context);
    }
    else {
      const scan = await scanFees();
      const res = await runScan(scan);
      return sendResponse(200, res, 'Success', null, context);
    }
  } catch (err) {
    logger.error(err);
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

function getQueryType(queryParams) {
  if (queryParams?.billingBy) {
    return WITH_BILLING;
  } else if (queryParams?.activity) {
    return BY_ACTIVITY;
  } else if (queryParams?.parkFeature) {
    return BY_PARK_FEATURE;
  } else if (queryParams?.ORCS) {
    return BY_ORCS;
  } else {
    return INSUFFICIENT_PARAMS;
  }
}
function queryFeeByORCS(queryParams) {
  if (!queryParams.ORCS) {
    throw {
      code: 400,
      error: 'Insufficient parameters.',
      msg: `Missing required query parameter: 'ORCS'`
    };
  }
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': {S: `${queryParams.ORCS}::FEES`}
    }
  };  
  return query;
}

function queryFeeByParkFeature(queryParams) {
  if (!queryParams.parkFeature || !queryParams.ORCS) {
    throw {
      code: 400,
      error: 'Insufficient parameters.',
      msg: `Missing required parameters for 'byparkFeature' query`
    };
  }
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `${queryParams.ORCS}::FEES` },
      ':sk': { S: queryParams.parkFeature }
    }
  };
  return query;
}

function queryFeeByActivity(queryParams) {
  if (!queryParams.activity || !queryParams.parkFeature || !queryParams.ORCS) {
    throw {
      code: 400,
      error: 'Insufficient parameters.',
      msg: `Missing required parameters for 'byActivity' query`
    };
  }
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `${queryParams.ORCS}::FEES` },
      ':sk': { S: `${queryParams.parkFeature}::${queryParams.activity}` }
    }
  };
  return query;
}

function queryFeeWithBilling(queryParams) {
  if (!queryParams.billingBy || !queryParams.activity || !queryParams.parkFeature || !queryParams.ORCS) {
    throw {
      code: 400,
      error: 'Insufficient parameters.',
      msg: `Missing required parameters for 'withBilling' query`
    };
  }
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `${queryParams.ORCS}::FEES` },
      ':sk': { S: `${queryParams.parkFeature}::${queryParams.activity}::${queryParams.billingBy}` }
    }
  };
  return query
}

async function scanFees() {
  let scan = {
    TableName: TABLE_NAME,
    FilterExpression: 'contains(pk, :fees)',
    ExpressionAttributeValues: {
      ':fees': { S: '::FEES' }
    }
  };
  return scan;
}
