// Simple in-memory cache implementation
// In production, you should use Redis or another caching solution

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const cache = new MemoryCache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Cache middleware factory
const createCacheMiddleware = (ttl = 5 * 60 * 1000, keyGenerator = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `cache:${req.method}:${req.originalUrl}`;

    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache hit for: ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`Caching response for: ${cacheKey}`);
        cache.set(cacheKey, data, ttl);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Specific cache configurations
const cacheConfigs = {
  // Cache product listings for 10 minutes
  products: createCacheMiddleware(10 * 60 * 1000, (req) => {
    const { page, limit, category, search, minPrice, maxPrice, sizes, colors, featured, isNewArrival, isSale, sortBy, sortOrder } = req.query;
    return `products:${page || 1}:${limit || 12}:${category || 'all'}:${search || 'none'}:${minPrice || 'none'}:${maxPrice || 'none'}:${sizes || 'none'}:${colors || 'none'}:${featured || 'none'}:${isNewArrival || 'none'}:${isSale || 'none'}:${sortBy || 'createdAt'}:${sortOrder || 'desc'}`;
  }),

  // Cache individual products for 30 minutes
  product: createCacheMiddleware(30 * 60 * 1000, (req) => {
    return `product:${req.params.id}`;
  }),

  // Cache categories for 1 hour
  categories: createCacheMiddleware(60 * 60 * 1000, () => {
    return 'categories:all';
  }),

  // Cache featured products for 15 minutes
  featuredProducts: createCacheMiddleware(15 * 60 * 1000, () => {
    return 'products:featured';
  }),

  // Cache user profile for 5 minutes
  userProfile: createCacheMiddleware(5 * 60 * 1000, (req) => {
    return `user:${req.user?.userId}:profile`;
  }),

  // Cache cart for 1 minute (frequently updated)
  cart: createCacheMiddleware(1 * 60 * 1000, (req) => {
    return `cart:${req.user?.userId}`;
  }),

  // Cache wishlist for 5 minutes
  wishlist: createCacheMiddleware(5 * 60 * 1000, (req) => {
    return `wishlist:${req.user?.userId}`;
  })
};

// Cache invalidation helpers
const invalidateCache = {
  // Invalidate product-related caches
  product: (productId) => {
    cache.delete(`product:${productId}`);
    // Invalidate product listings (this is a simple approach)
    // In production, you'd want more sophisticated invalidation
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith('products:')) {
        cache.delete(key);
      }
    });
  },

  // Invalidate user-related caches
  user: (userId) => {
    cache.delete(`user:${userId}:profile`);
    cache.delete(`cart:${userId}`);
    cache.delete(`wishlist:${userId}`);
  },

  // Invalidate category caches
  categories: () => {
    cache.delete('categories:all');
  },

  // Clear all cache
  all: () => {
    cache.clear();
  }
};

// Cache statistics endpoint
const getCacheStats = (req, res) => {
  const stats = cache.getStats();
  res.json({
    success: true,
    data: {
      ...stats,
      memoryUsage: process.memoryUsage()
    }
  });
};

module.exports = {
  cache,
  createCacheMiddleware,
  cacheConfigs,
  invalidateCache,
  getCacheStats
};
