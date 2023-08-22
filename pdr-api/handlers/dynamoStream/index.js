const { logger } = require('/opt/loggerUtils');
const { putItem } = require('/opt/dynamodb');

exports.handler = async function (event, context) {
  logger.info('Stream Handler');
  logger.debug(event);
  for (const record of event?.Records) {
    const eventName = record.eventName;
    const newImage = record.dynamodb.NewImage;
    const oldImage = record.dynamodb.OldImage;
    const creationTime = new Date(record.dynamodb.ApproximateCreationDateTime).toISOString();
    const gsipk = record.dynamodb.Keys.pk.S;
    const gsisk = record.dynamodb.Keys.sk.S;
    const user = newImage?.lastModifiedBy.S;

    const auditImage = {
      pk: user,
      sk: creationTime,
      gsipk: gsipk,
      gsisk: gsisk,
      newImage: newImage,
      oldImage: oldImage,
      operation: eventName
    };

    await putItem(auditImage);
  }
};