// Frontend configuration
const config = {
  development: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
    frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    environment: 'development',
    enableAnalytics: false,
    enableDebugLogs: true
  },
  
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || '',
    environment: 'production',
    enableAnalytics: true,
    enableDebugLogs: false
  }
};

// Get current environment
const getEnvironment = (): 'development' | 'production' => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

// Get current configuration
export const getConfig = () => {
  const env = getEnvironment();
  return config[env];
};

// Validate configuration
export const validateConfig = () => {
  const currentConfig = getConfig();
  const env = getEnvironment();
  
  if (env === 'production') {
    const requiredVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_FRONTEND_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  console.log(`✅ Frontend configuration loaded for: ${env}`);
  return currentConfig;
};

// API client configuration
export const apiConfig = {
  baseURL: getConfig().apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

export default getConfig;
