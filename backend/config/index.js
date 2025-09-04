const config = {
  development: {
    port: process.env.PORT || 5001,
    nodeEnv: 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:5001',
    
    // Database
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub',
    
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    
    // Cloudinary
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    
    // Stripe
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    
    // Email
    email: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    
    // Rate Limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
    },
    
    // File Upload
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
      uploadPath: process.env.UPLOAD_PATH || './uploads'
    }
  },
  
  production: {
    port: process.env.PORT || 5001,
    nodeEnv: 'production',
    frontendUrl: process.env.FRONTEND_URL,
    apiUrl: process.env.API_URL,
    
    // Database
    mongodbUri: process.env.MONGODB_URI,
    
    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    
    // Cloudinary
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    
    // Stripe
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    
    // Email
    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    
    // Rate Limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    
    // File Upload
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
      uploadPath: process.env.UPLOAD_PATH || './uploads'
    }
  }
};

// Validate required environment variables in production
const validateEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  const currentConfig = config[env];
  
  if (env === 'production') {
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'FRONTEND_URL',
      'API_URL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      process.exit(1);
    }
  }
  
  console.log(`✅ Environment configuration loaded for: ${env}`);
  return currentConfig;
};

const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env];
};

module.exports = {
  config,
  getConfig,
  validateEnvironment
};
