const { createLogger, format, transports } = require("winston");
const { combine, timestamp } = format;

const LEVEL = process.env.LOG_LEVEL || "error";

exports.logger = createLogger({
  level: LEVEL,
  format: combine(
    timestamp(),
    format.printf((info) => {
      let meta = "";
      let symbols = Object.getOwnPropertySymbols(info);
      if (symbols.length == 2) {
        meta = JSON.stringify(info[symbols[1]]);
      }
      return `${info.timestamp} ${[info.level.toUpperCase()]}: ${
        info.message
      } ${meta}`;
    })
  ),
  transports: [new transports.Console()],
});

exports.sendResponse = function (code, data, context) {
  const response = {
    statusCode: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
    },
    body: JSON.stringify(data),
  };
  return response;
};

exports.checkWarmup = function (event) {
  if (event?.warmup === true) {
    return true;
  } else {
    return false;
  }
};
