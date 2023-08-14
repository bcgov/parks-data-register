const { sendResponse } = require('/opt/responseUtils');
const { logger } = require('/opt/loggerUtils');

exports.handler = async function () {
  logger.info('Hello World POST');
  try {
    // function here
    return sendResponse(200, {
      msg: 'Hello World POST success'
    })
  } catch (error) {
    logger.error('Hello World POST error:', error)
    return sendResponse(500, {
      msg: 'Hello World POST error',
      error: error
    })
  }
}