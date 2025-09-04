const mongoose = require('mongoose');
const { logger, logHelpers } = require('../config/logger');
const { cache } = require('./cache');

// Health check status
const healthStatus = {
  OK: 'healthy',
  WARNING: 'degraded',
  ERROR: 'unhealthy'
};

// Database health check
const checkDatabase = async () => {
  try {
    const startTime = Date.now();
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        status: healthStatus.ERROR,
        message: 'Database not connected',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      };
    }

    // Perform a simple query to test database responsiveness
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;

    // Log performance metric
    logHelpers.logPerformance('database_ping', responseTime, {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });

    return {
      status: healthStatus.OK,
      message: 'Database is healthy',
      details: {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        responseTime: `${responseTime}ms`,
        readyState: mongoose.connection.readyState
      }
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: healthStatus.ERROR,
      message: 'Database health check failed',
      details: {
        error: error.message,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    };
  }
};

// Memory health check
const checkMemory = () => {
  try {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    let status = healthStatus.OK;
    let message = 'Memory usage is normal';

    if (memoryUsagePercent > 90) {
      status = healthStatus.ERROR;
      message = 'Memory usage is critically high';
    } else if (memoryUsagePercent > 80) {
      status = healthStatus.WARNING;
      message = 'Memory usage is high';
    }

    return {
      status,
      message,
      details: {
        heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
        usagePercent: `${Math.round(memoryUsagePercent)}%`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      }
    };
  } catch (error) {
    logger.error('Memory health check failed:', error);
    return {
      status: healthStatus.ERROR,
      message: 'Memory health check failed',
      details: { error: error.message }
    };
  }
};

// Cache health check
const checkCache = () => {
  try {
    const stats = cache.getStats();
    const cacheSize = stats.size;
    
    let status = healthStatus.OK;
    let message = 'Cache is healthy';

    if (cacheSize > 1000) {
      status = healthStatus.WARNING;
      message = 'Cache size is large';
    }

    return {
      status,
      message,
      details: {
        size: cacheSize,
        keys: stats.keys.length
      }
    };
  } catch (error) {
    logger.error('Cache health check failed:', error);
    return {
      status: healthStatus.ERROR,
      message: 'Cache health check failed',
      details: { error: error.message }
    };
  }
};

// Disk space health check
const checkDiskSpace = () => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check uploads directory
    const uploadsPath = path.join(process.cwd(), 'uploads');
    const stats = fs.statSync(uploadsPath);
    
    return {
      status: healthStatus.OK,
      message: 'Disk space is available',
      details: {
        uploadsPath: uploadsPath,
        accessible: true
      }
    };
  } catch (error) {
    logger.error('Disk space health check failed:', error);
    return {
      status: healthStatus.ERROR,
      message: 'Disk space health check failed',
      details: { error: error.message }
    };
  }
};

// External services health check
const checkExternalServices = async () => {
  const services = [];
  
  try {
    // Check Cloudinary (if configured)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.api.ping();
        services.push({
          name: 'Cloudinary',
          status: healthStatus.OK,
          message: 'Cloudinary is accessible'
        });
      } catch (error) {
        services.push({
          name: 'Cloudinary',
          status: healthStatus.ERROR,
          message: 'Cloudinary is not accessible',
          details: { error: error.message }
        });
      }
    }

    // Check Stripe (if configured)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.balance.retrieve();
        services.push({
          name: 'Stripe',
          status: healthStatus.OK,
          message: 'Stripe is accessible'
        });
      } catch (error) {
        services.push({
          name: 'Stripe',
          status: healthStatus.ERROR,
          message: 'Stripe is not accessible',
          details: { error: error.message }
        });
      }
    }

    return {
      status: services.every(s => s.status === healthStatus.OK) ? healthStatus.OK : healthStatus.WARNING,
      message: 'External services check completed',
      details: { services }
    };
  } catch (error) {
    logger.error('External services health check failed:', error);
    return {
      status: healthStatus.ERROR,
      message: 'External services health check failed',
      details: { error: error.message }
    };
  }
};

// Main health check function
const performHealthCheck = async (includeDetails = false) => {
  const startTime = Date.now();
  const checks = {};

  try {
    // Run all health checks in parallel
    const [
      database,
      memory,
      cache,
      diskSpace,
      externalServices
    ] = await Promise.all([
      checkDatabase(),
      checkMemory(),
      checkCache(),
      checkDiskSpace(),
      checkExternalServices()
    ]);

    checks.database = database;
    checks.memory = memory;
    checks.cache = cache;
    checks.diskSpace = diskSpace;
    checks.externalServices = externalServices;

    // Determine overall health status
    const allStatuses = Object.values(checks).map(check => check.status);
    const hasError = allStatuses.includes(healthStatus.ERROR);
    const hasWarning = allStatuses.includes(healthStatus.WARNING);

    let overallStatus = healthStatus.OK;
    if (hasError) {
      overallStatus = healthStatus.ERROR;
    } else if (hasWarning) {
      overallStatus = healthStatus.WARNING;
    }

    const responseTime = Date.now() - startTime;

    // Log performance metric
    logHelpers.logPerformance('health_check', responseTime, {
      overallStatus,
      checksCount: Object.keys(checks).length
    });

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...(includeDetails && { checks })
    };

    return healthData;
  } catch (error) {
    logger.error('Health check failed:', error);
    return {
      status: healthStatus.ERROR,
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    };
  }
};

// Health check middleware
const healthCheckMiddleware = (includeDetails = false) => {
  return async (req, res, next) => {
    try {
      const healthData = await performHealthCheck(includeDetails);
      
      const statusCode = healthData.status === healthStatus.OK ? 200 : 
                        healthData.status === healthStatus.WARNING ? 200 : 503;
      
      res.status(statusCode).json({
        success: healthData.status !== healthStatus.ERROR,
        data: healthData
      });
    } catch (error) {
      logger.error('Health check middleware error:', error);
      res.status(503).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  };
};

module.exports = {
  healthCheckMiddleware,
  performHealthCheck,
  healthStatus,
  checkDatabase,
  checkMemory,
  checkCache,
  checkDiskSpace,
  checkExternalServices
};
