# Development Setup Guide

## Rate Limiting Issues Fixed! ✅

The rate limiting has been significantly relaxed for development:

### Current Rate Limits (Development)
- **General API**: 10,000 requests per 15 minutes
- **Auth endpoints**: 100 requests per 15 minutes  
- **Products**: 5,000 requests per 15 minutes
- **Admin**: 1,000 requests per 15 minutes
- **Uploads**: 100 uploads per hour

### Completely Disable Rate Limiting (Optional)

If you still experience issues, you can completely disable rate limiting by setting an environment variable:

```bash
# In your terminal before starting the server
export DISABLE_RATE_LIMIT=true
npm run dev
```

Or add it to your `.env` file:
```
DISABLE_RATE_LIMIT=true
```

### Testing the Fix

The following endpoints should now work without rate limiting issues:

1. **Categories**: `GET /api/categories` ✅
2. **Products**: `GET /api/products` ✅  
3. **Auth**: `POST /api/auth/login` ✅
4. **Cart**: `GET /api/cart` ✅
5. **Wishlist**: `GET /api/wishlist` ✅

### What Was Fixed

1. **Increased rate limits** for development environment
2. **Environment-based configuration** (dev vs prod limits)
3. **Option to completely disable** rate limiting in development
4. **Proper error handling** for rate limit responses

### Production vs Development

- **Development**: Very lenient limits (10k+ requests)
- **Production**: Reasonable limits (100-1000 requests)
- **Security**: Still maintains protection against abuse

Your website should now work perfectly! 🎉
