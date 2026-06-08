const fs = require("fs");
const path = require("path");
const winston = require("winston");
require("dotenv").config();

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_MAX_SIZE = Number(process.env.LOG_MAX_SIZE_MB || 5) * 1024 * 1024;
const LOG_MAX_FILES = Number(process.env.LOG_MAX_FILES || 5);
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const lineFormat = winston.format.printf(({ timestamp, level, message, module, stack }) => {
  const source = module || "server.js";
  const line = `[${timestamp}] [${level.toUpperCase()}] [${source}] - ${message}`;
  return stack ? `${line}\n${stack}` : line;
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    lineFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "app.log"),
      maxsize: LOG_MAX_SIZE,
      maxFiles: LOG_MAX_FILES,
      tailable: true
    })
  ]
});

function createModuleLogger(moduleName) {
  return {
    info(message) {
      logger.info(message, { module: moduleName });
    },
    warn(message) {
      logger.warn(message, { module: moduleName });
    },
    error(message, error) {
      logger.error(message, {
        module: moduleName,
        stack: error?.stack
      });
    }
  };
}

module.exports = { logger, createModuleLogger, LOG_DIR };
