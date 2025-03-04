const { runQuery, runScan, TABLE_NAME} = require('/opt/dynamodb');
const { sendResponse, logger } = require('/opt/base');


exports.handler = async (event, context) => {

  logger.debug('Get all fees for specific park', event);
  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    const queryParams = event.queryStringParameters;
    const queryType = getQueryType(queryParams);

    let query;
    if(queryParams){
      switch (queryType) {
        case 'withBilling':
          if (!queryParams.billingBy || !queryParams.activity || !queryParams.parkFeature || !queryParams.ORCS) {
            throw {
              code: 400,
              error: 'Insufficient parameters.',
              msg: `Missing required parameters for 'withBilling' query`
            };
          }
          query = queryFeeWithBilling(queryParams.billingBy, queryParams.activity, queryParams.parkFeature, queryParams.ORCS);
          break;
        case 'byActivity':
          if (!queryParams.activity || !queryParams.parkFeature || !queryParams.ORCS) {
            throw {
              code: 400,
              error: 'Insufficient parameters.',
              msg: `Missing required parameters for 'byActivity' query`
            };
          }
          query = queryFeeByActivity(queryParams.activity, queryParams.parkFeature, queryParams.ORCS);
          break;
        case 'byparkFeature':
          if (!queryParams.parkFeature || !queryParams.ORCS) {
            throw {
              code: 400,
              error: 'Insufficient parameters.',
              msg: `Missing required parameters for 'byparkFeature' query`
            };
          }
          query = queryFeeByParkFeature(queryParams.parkFeature, queryParams.ORCS);
          break;
        case 'byORCS':
          if (!queryParams.ORCS) {
            throw {
              code: 400,
              error: 'Insufficient parameters.',
              msg: `Missing required query parameter: 'ORCS'`
            };
          }
          query = queryFeeByORCS(queryParams.ORCS);
          break;
        default:
          throw {
            code: 400,
            error: 'Insufficient parameters.',
            msg: `Missing required query parameter: 'ORCS'`
          };
      }

      let res = await runQuery(query);
      return sendResponse(200, res, 'Success', null, context);
    }
    else {
      let scan = await scanFees();
      let res = await runScan(scan);
      return sendResponse(200, res, 'Success', null, context);
    }
  } catch (err) {
    logger.error(err);
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};

function getQueryType(queryParams) {
  if (queryParams?.billingBy) {
    return 'withBilling';
  } else if (queryParams?.activity) {
    return 'byActivity';
  } else if (queryParams?.parkFeature) {
    return 'byparkFeature';
  } else if (queryParams?.ORCS) {
    return 'byORCS';
  } else {
    return 'insufficientParams';
  }
}
  function queryFeeByORCS(ORCS) {
    let query = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': {S: `${ORCS}::FEES`}
      }
    };  
    return query;
  }

  function queryFeeByParkFeature(parkFeature, ORCS) {
    let query = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `${ORCS}::FEES` },
        ':sk': { S: parkFeature }
      }
    };
    return query;
  }

function queryFeeByActivity(activity, parkFeature, ORCS) {
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `${ORCS}::FEES` },
      ':sk': { S: `${parkFeature}::${activity}` }
    }
  };
  return query;
}

function queryFeeWithBilling(billing, activity, parkFeature, ORCS) {
  let query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `${ORCS}::FEES` },
      ':sk': { S: `${parkFeature}::${activity}::${billing}` }
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
