
const { sendResponse, logger } = require('/opt/base');
const { TABLE_NAME, putItem } = require('/opt/dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { FEES_OPTIONAL_PUT_FIELDS } = require('/opt/data-constants');

exports.handler = async function (event, context) {
  logger.debug('Post:', event); 

  if (event.httpMethod === 'OPTIONS') {
    return sendResponse(200, {}, 'Success', null, context);
  }

  try {
    // Extract query parameters from the event
    const queryParams = event.queryStringParameters;
    logger.debug('Query Parameters:', queryParams);
    const requiredParams = ['ORCS', 'parkFeature', 'activity', 'chargeBy', 'billingBy', 'feeValue'];

    for (const param of requiredParams) {
      if (!queryParams?.[param]) {
        logger.error(`Bad Request - Missing Param: ${param}`);
        return sendResponse(400, {}, 'Bad Request', `Missing Param: ${param}`, context);
      }
    }

    //Only allow the valid charge by parameters
    if(!FEES_OPTIONAL_PUT_FIELDS.includes(queryParams.chargeBy)){
      logger.error(`Bad Request - Invalid Param: ${queryParams.chargeBy}`);
      return sendResponse(400, {}, 'Bad Request', `Invalid chargeBy Param: ${queryParams.chargeBy}`, context);
    }

    // Check if the user is an admin
    const isAdmin = event?.requestContext?.authorizer?.isAdmin || false;

    if (isAdmin) {
      // Construct the item to be POST into DynamoDB
      const item = {
        pk: `${queryParams.ORCS}::FEES`,
        sk: `${queryParams.parkFeature}::${queryParams.activity}::${queryParams.billingBy}`,
        [queryParams.chargeBy]: queryParams.feeValue,
        parkFeature: queryParams.parkFeature,
        activity: queryParams.activity,
        billingBy: queryParams.billingBy,
        ORCS: queryParams.ORCS
      };
      logger.debug('Constructed Item:', item);

      // POST item
      try{
        let res = await putItem(marshall(item), TABLE_NAME);
        logger.debug('DynamoDB Response:', res);
        return sendResponse(200, res, 'Success', null, context);
      }catch (err) {
        //Duplicate entry
        if (err.name === 'ConditionalCheckFailedException') {
          logger.error('Duplicate entry detected:', err);
          return sendResponse(
            409,
            {},
            'Conflict',
            'This fee is already in the database. Please use unique values.',
            context
          );
        }
        //Other error with dynamo
        logger.error('Error inserting item into DynamoDB:', err);
        return sendResponse(500, {}, 'Error', 'Error inserting item into DynamoDB', context);
      }
    } else {
      return sendResponse(400, {}, 'Bad Request', 'must be admin to create a fee', context);
    }
  } catch (err) {
    logger.error('Error:', JSON.stringify(err));

    // Send an error response
    return sendResponse(err?.code || 400, [], err?.msg || 'Error', err?.error || err, context);
  }
};