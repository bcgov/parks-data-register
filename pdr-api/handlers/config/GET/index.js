const { runQuery, TABLE_NAME } = require("/opt/dynamodb");
const { sendResponse, checkWarmup, logger } = require("/opt/base");

exports.handler = async (event, context) => {
  logger.debug("Read Config", event);
  if (checkWarmup(event)) {
    return sendResponse(200, {});
  }

  let queryObj = {
    TableName: TABLE_NAME,
  };

  try {
    queryObj.ExpressionAttributeValues = {};
    queryObj.ExpressionAttributeValues[":pk"] = { S: "config" };
    queryObj.ExpressionAttributeValues[":sk"] = { S: "config" };
    queryObj.KeyConditionExpression = "pk =:pk AND sk =:sk";

    const configData = await runQuery(queryObj);
    return sendResponse(200, configData[0], context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, err, context);
  }
};
