const AWS = require("aws-sdk");
const { logger } = require('/opt/base');
const { batchWriteData, AUDIT_TABLE_NAME } = require('/opt/dynamodb');
const { defaultProvider } = require('@aws-sdk/credential-provider-node'); // V3 SDK.
const { Client } = require('@opensearch-project/opensearch');
const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.OPENSEARCH_DOMAIN_ENDPOINT;
const OPENSEARCH_MAIN_INDEX = process.env.OPENSEARCH_MAIN_INDEX;

const openSearchClient = new Client({
  ...AwsSigv4Signer({
    region: 'ca-central-1',
    service: 'es',
    getCredentials: () => {
      // Any other method to acquire a new Credentials object can be used.
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  node: OPENSEARCH_DOMAIN_ENDPOINT, // OpenSearch domain URL
});

exports.handler = async function (event, context) {
  logger.info('Stream Handler');
  logger.debug(event);
  try {
    let auditRecordsToCreate = [];
    for (const record of event?.Records) {
      const eventName = record.eventName;
      let newImage = record.dynamodb.NewImage;
      let oldImage = record.dynamodb.OldImage;

      // Prune the notes field from search
      delete newImage.notes;
      delete oldImage.notes;

      let createDate = new Date(0);
      createDate.setUTCSeconds(record.dynamodb.ApproximateCreationDateTime);
      const creationTime = createDate.toISOString();

      const gsipk = record.dynamodb.Keys.pk;
      const gsisk = record.dynamodb.Keys.sk;
      const user = newImage?.lastModifiedBy?.S || "system";

      // This forms the primary key in opensearch so we can reference it later to update/remove if need be
      const openSearchId = `${record.dynamodb.Keys.pk.S}#${record.dynamodb.Keys.sk.S}`;

      logger.info(`openSearchId:${JSON.stringify(openSearchId)}`);

      const auditImage = {
        pk: AWS.DynamoDB.Converter.input(user),
        sk: AWS.DynamoDB.Converter.input(creationTime),
        gsipk: gsipk,
        gsisk: gsisk,
        newImage: { "M": newImage },
        oldImage: { "M": oldImage },
        operation: AWS.DynamoDB.Converter.input(eventName)
      };

      logger.debug(`auditImage:${JSON.stringify(auditImage)}`);

      switch (record.eventName) {
        case 'MODIFY':
        case 'INSERT': {
          // Add/update index.
          const data = {
            id: openSearchId,
            index: OPENSEARCH_MAIN_INDEX,
            body: AWS.DynamoDB.Converter.unmarshall(newImage),
            refresh: true
          };
          logger.debug(JSON.stringify(data));
          await openSearchClient.index(data);
        } break;
        case 'REMOVE': {
          // Remove it from the index
          const data = {
            id: openSearchId,
            index: OPENSEARCH_MAIN_INDEX
          };
          logger.debug(JSON.stringify(data));
          await openSearchClient.delete(data);
        }
      }

      auditRecordsToCreate.push(auditImage);
    }

    // Write it all out to the Audit table
    logger.info(`Writing batch data`);
    await batchWriteData(auditRecordsToCreate, 25, AUDIT_TABLE_NAME);
  } catch (e) {
    console.log(e);
    logger.error(JSON.stringify(e));
  }
};