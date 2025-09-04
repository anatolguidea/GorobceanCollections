const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxSize: '20m',
      maxFiles: '14d',
    })
  );

  // Combined log file
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxSize: '20m',
      maxFiles: '14d',
    })
  );

  // HTTP request log file
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxSize: '20m',
      maxFiles: '7d',
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
const stream = {
  write: (message) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Custom loggers for different purposes
const loggers = {
  // General application logger
  app: logger,

  // Database operations logger
  database: winston.createLogger({
    level: 'info',
    levels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            (info) => `[DB] ${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
      }),
      ...(process.env.NODE_ENV === 'production' ? [
        new DailyRotateFile({
          filename: path.join('logs', 'database-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxSize: '20m',
          maxFiles: '14d',
        })
      ] : [])
    ],
  }),

  // Security events logger
  security: winston.createLogger({
    level: 'warn',
    levels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            (info) => `[SECURITY] ${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
      }),
      ...(process.env.NODE_ENV === 'production' ? [
        new DailyRotateFile({
          filename: path.join('logs', 'security-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxSize: '20m',
          maxFiles: '30d', // Keep security logs longer
        })
      ] : [])
    ],
  }),

  // Performance logger
  performance: winston.createLogger({
    level: 'info',
    levels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            (info) => `[PERF] ${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
      }),
      ...(process.env.NODE_ENV === 'production' ? [
        new DailyRotateFile({
          filename: path.join('logs', 'performance-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxSize: '20m',
          maxFiles: '7d',
        })
      ] : [])
    ],
  }),
};

// Helper functions for structured logging
const logHelpers = {
  // Log API requests
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId || 'anonymous',
    };

    if (res.statusCode >= 400) {
      loggers.app.warn('API Request Error', logData);
    } else {
      loggers.app.http('API Request', logData);
    }
  },

  // Log database operations
  logDatabase: (operation, collection, duration, error = null) => {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      error: error?.message,
    };

    if (error) {
      loggers.database.error('Database Error', logData);
    } else {
      loggers.database.info('Database Operation', logData);
    }
  },

  // Log security events
  logSecurity: (event, details) => {
    loggers.security.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log performance metrics
  logPerformance: (metric, value, context = {}) => {
    loggers.performance.info('Performance Metric', {
      metric,
      value,
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  // Log errors with context
  logError: (error, context = {}) => {
    loggers.app.error('Application Error', {
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = {
  logger,
  loggers,
  stream,
  logHelpers,
};
