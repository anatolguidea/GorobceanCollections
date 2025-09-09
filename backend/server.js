const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

// Import configuration and database connection
const { getConfig, validateEnvironment } = require('./config');
const connectDB = require('./config/database');
const { logger, stream, logHelpers } = require('./config/logger');

// Validate environment and get configuration
validateEnvironment();
const config = getConfig();

const app = express();
const PORT = config.port;

// Import middleware
const { responseFormatter } = require('./middleware/responseFormatter');
const { getCacheStats } = require('./middleware/cache');
const { healthCheckMiddleware } = require('./middleware/healthCheck');
const { auth } = require('./middleware/auth');
const { 
  sanitizeInput, 
  mongoSanitizer, 
  xssProtection, 
  rateLimiters, 
  securityHeaders, 
  requestSizeLimit, 
  securityLogger 
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5001", "https://localhost:5001", "blob:", "https:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Additional security headers
app.use(securityHeaders);

// Request size limiting
app.use(requestSizeLimit);

// Security logging
app.use(securityLogger);

// Input sanitization
app.use(expressSanitizer());
app.use(sanitizeInput);

// MongoDB injection protection
app.use(mongoSanitizer);

// XSS protection
app.use(xssProtection);

// CORS configuration
app.use(cors({
  origin: [
    config.frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - skip in development if DISABLE_RATE_LIMIT is set
if (!process.env.DISABLE_RATE_LIMIT) {
  app.use('/api/', rateLimiters.general);
  app.use('/api/auth/', rateLimiters.auth);
  app.use('/api/products/', rateLimiters.products);
  app.use('/api/admin/', rateLimiters.admin);
  app.use('/api/upload/', rateLimiters.upload);
} else {
  console.log('⚠️  Rate limiting disabled for development');
}

// Logging middleware
app.use(morgan('combined', { stream }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logHelpers.logRequest(req, res, responseTime);
  });
  
  next();
});

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response formatter middleware
app.use(responseFormatter);

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for images
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static('uploads'));

// Health check endpoints
app.get('/health', healthCheckMiddleware(false));
app.get('/health/detailed', healthCheckMiddleware(true));

// Cache statistics endpoint (admin only)
app.get('/cache/stats', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  getCacheStats(req, res);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log the error
  logHelpers.logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || 'anonymous',
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Rate limit error handler
app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(err.ms / 1000)
    });
  }
  next(err);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`🚀 StyleHub API server running on port ${PORT}`);
      logger.info(`📱 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🗄️  Database: Connected to MongoDB`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
