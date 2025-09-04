// Response formatter middleware for consistent API responses
const responseFormatter = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;

  // Override the json method
  res.json = function(data) {
    // Determine if the response is successful based on status code
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    
    // Create standardized response format
    const formattedResponse = {
      success: isSuccess,
      timestamp: new Date().toISOString(),
      ...(isSuccess ? { data } : { error: data.message || data }),
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress
        }
      })
    };

    // Call the original json method with the formatted response
    return originalJson.call(this, formattedResponse);
  };

  // Store the original send method
  const originalSend = res.send;

  // Override the send method for non-JSON responses
  res.send = function(data) {
    // Only format if it's not already formatted and it's a JSON response
    if (typeof data === 'object' && data !== null && !data.success) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      
      const formattedResponse = {
        success: isSuccess,
        timestamp: new Date().toISOString(),
        ...(isSuccess ? { data } : { error: data.message || data }),
        ...(process.env.NODE_ENV === 'development' && { 
          debug: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
          }
        })
      };

      return originalSend.call(this, JSON.stringify(formattedResponse));
    }

    return originalSend.call(this, data);
  };

  next();
};

// Success response helper
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error response helper
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

// Validation error response helper
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array ? errors.array() : errors,
    timestamp: new Date().toISOString()
  });
};

// Not found response helper
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Unauthorized response helper
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Forbidden response helper
const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  responseFormatter,
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
