const expressSanitizer = require('express-sanitizer');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove HTML tags and potentially dangerous characters
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }

  next();
};

// MongoDB injection protection
const mongoSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt detected: ${key} in ${req.originalUrl}`);
  }
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
  // Set XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Development vs Production rate limiting
const isDevelopment = process.env.NODE_ENV === 'development';

// Specific rate limiters
const rateLimiters = {
  // General API rate limiting - much more lenient for development
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    isDevelopment ? 10000 : 1000, // 10k requests in dev, 1k in prod
    'Too many requests from this IP, please try again later.'
  ),

  // Auth endpoints - more lenient for development
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    isDevelopment ? 100 : 50, // 100 requests in dev, 50 in prod
    'Too many authentication attempts, please try again later.'
  ),

  // Product operations - more lenient
  products: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    isDevelopment ? 5000 : 500, // 5k requests in dev, 500 in prod
    'Too many product requests, please try again later.'
  ),

  // Admin operations - more lenient
  admin: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    isDevelopment ? 1000 : 200, // 1k requests in dev, 200 in prod
    'Too many admin requests, please try again later.'
  ),

  // File uploads - more lenient
  upload: createRateLimit(
    60 * 60 * 1000, // 1 hour
    isDevelopment ? 100 : 50, // 100 uploads in dev, 50 in prod
    'Too many file uploads, please try again later.'
  )
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  next();
};

// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /script/i,
    /javascript:/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    url: req.originalUrl
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestString)
  );
  
  if (isSuspicious) {
    console.warn(`🚨 Suspicious request detected:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

module.exports = {
  sanitizeInput,
  mongoSanitizer,
  xssProtection,
  rateLimiters,
  securityHeaders,
  requestSizeLimit,
  ipWhitelist,
  securityLogger
};
