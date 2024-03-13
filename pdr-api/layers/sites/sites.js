const { logger } = require('/opt/base');
const { dynamodb, TABLE_NAME } = require('/opt/dynamodb');

exports.updateParkSiteObj = async function (pk, siteId, params, returnParams = false) {
    logger.debug("Updating park site object", siteId);
    logger.debug("Params:", params);

    let updatedAttributeValues = {};

    // For now, siteObj only has displayName
    if (params?.displayName) {
        updatedAttributeValues['displayName'] = { S: params.displayName }
        updateExpression.push(`displayName = :${params.displayName}`);
    }

    const updateParams = {
        TableName: TABLE_NAME,
        Key: {
            pk: { S: pk },
            sk: { S: `Site::${siteId}` }
        },
        ExpressionAttributeValues: updatedAttributeValues,
        UpdateExpression: updateExpression.join(', '),
        ReturnValues: 'ALL_NEW'
    }

    // Return params in case you want to do a transaction
    if (returnParams) {
        return updateParams;
    } else {
        return await dynamodb.updateItem(params).promise();
    }
}