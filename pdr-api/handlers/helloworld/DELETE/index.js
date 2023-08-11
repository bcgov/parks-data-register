const { sendResponse } = require('/opt/responseUtils');
const { logger } = require('/opt/logger')

exports.handler = async function () {
  logger.info('Hello World DELETE');
  try {
    // function here
    return sendResponse(200, {
      msg: 'Hello World DELETE success'
    })
  } catch (error) {
    logger.error('Hello World DELETE error:', error)
    return sendResponse(500, {
      msg: 'Hello World DELETE error',
      error: error
    })
  }
}