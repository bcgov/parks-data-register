
const { sendResponse, logger } = require('/opt/base');
const { TABLE_NAME, putItem } = require('/opt/dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

exports.handler = async function (event, context) {
  logger.debug('Post:', event); 

  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Extract query parameters from the event
    const queryParams = event.queryStringParameters;
    logger.debug('Query Parameters:', queryParams);
    const requiredParams = ['ORCS', 'parkFeature', 'service', 'chargeBy', 'billBy', 'feeValue'];

    for (const param of requiredParams) {
      if (!queryParams?.[param]) {
        logger.error(`Bad Request - Missing Param: ${param}`);
        return sendResponse(400, {}, 'Bad Request', `Missing Param: ${param}`, context);
      }
    }

    // Check if the user is an admin
    const isAdmin = event?.requestContext?.authorizer?.isAdmin || false;

    if (isAdmin) {
      // Construct the item to be POST into DynamoDB
      const item = {
        pk: `${queryParams.ORCS}::FEES`,
        sk: `${queryParams.parkFeature}::${queryParams.service}::${queryParams.billBy}`,
        [queryParams.chargeBy]: queryParams.feeValue
      };
      logger.debug('Constructed Item:', item);

      // POST item
      let res = await putItem(marshall(item), TABLE_NAME);
      logger.debug('DynamoDB Response:', res);
      return sendResponse(200, res, 'Success', null, context);
    } else {
      return sendResponse(400, {}, 'Bad Request', 'must be admin to create a fee', context);
    }
  } catch (err) {
    logger.error('Error:', JSON.stringify(err));

    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};