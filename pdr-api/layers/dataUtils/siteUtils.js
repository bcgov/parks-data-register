const { logger } = require('/opt/base');
const { TABLE_NAME, runQuery } = require('/opt/dynamodb');

/**
 * Asynchronously retrieves all sites for a given protected area.
 *
 * @async
 * @function getSitesForProtectedArea
 * @param {string} identifier - The identifier of the Protected Area.
 * @returns {Promise} - A Promise that resolves when the sites have been retrieved.
 *
 * @example
 * await getSitesForProtectedArea('123');
 */
async function getSitesForProtectedArea(identifier) {
  const query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: identifier },
      ':sk': { S: 'Site::' }
    }
  };
  logger.info('Get list of sites for a protected area');
  const res = await runQuery(query);
  logger.debug(res);
  return res;
}

module.exports = {
  getSitesForProtectedArea
};