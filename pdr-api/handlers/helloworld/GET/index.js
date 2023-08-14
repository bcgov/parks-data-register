const { sendResponse } = require('/opt/responseUtils');
const { logger } = require('/opt/loggerUtils');

// local dependency
const { DateTime } = require('luxon')

exports.handler = async function (event, context) {
  logger.info('Hello World GET');
  console.log('DateTime.now().toISO():', DateTime.now().toISO());
  try {
    // function here
    return sendResponse(200, {
      msg: 'Hello World GET success'
    })
  } catch (error) {
    logger.error('Hello World GET error:', error)
    return sendResponse(500, {
      msg: 'Hello World GET error',
      error: error
    })
  }
}