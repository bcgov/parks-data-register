const { sendResponse } = require('/opt/responseUtils');
const { logger } = require('/opt/loggerUtils');

exports.handler = async function () {
  logger.info('Hello World PUT');
  try {
    // function here
    return sendResponse(200, {
      msg: 'Hello World PUT success'
    })
  } catch (error) {
    logger.error('Hello World PUT error:', error)
    return sendResponse(500, {
      msg: 'Hello World PUT error',
      error: error
    })
  }
}