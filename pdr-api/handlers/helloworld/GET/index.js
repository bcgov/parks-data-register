const { sendResponse } = require('/opt/responseUtils');
const { logger } = require('/opt/logger')

exports.handler = async function () {
  logger.info('Hello World GET');
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