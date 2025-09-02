const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Product description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value >= this.price;
      },
      message: 'Original price must be greater than or equal to current price'
    }
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['T-Shirts', 'Jeans', 'Blazers', 'Dresses', 'Hoodies', 'Pants', 'Polo Shirts', 'Jackets'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    // Cloudinary specific fields
    publicId: {
      type: String,
      required: true
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    format: {
      type: String
    },
    size: {
      type: Number // File size in bytes
    },
    folder: {
      type: String
    }
  }],
  sizes: [{
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46']
  }],
  colors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    hex: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code']
    },
    inStock: {
      type: Boolean,
      default: true
    }
  }],
  inventory: [{
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    reserved: {
      type: Number,
      min: [0, 'Reserved quantity cannot be negative'],
      default: 0
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  care: [{
    type: String,
    trim: true
  }],
  materials: [{
    type: String,
    trim: true
  }],
  brand: {
    type: String,
    trim: true,
    default: 'StyleHub'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    images: [{
      url: String,
      alt: String
    }],
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      helpful: Boolean
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isSale: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  salePercentage: {
    type: Number,
    min: [0, 'Sale percentage cannot be negative'],
    max: [100, 'Sale percentage cannot exceed 100'],
    validate: {
      validator: function(value) {
        return !this.isSale || (value && value > 0);
      },
      message: 'Sale percentage is required when product is on sale'
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shipping: {
    free: {
      type: Boolean,
      default: false
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, isActive: 1 });
productSchema.index({ isSale: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  if (!this.images || !Array.isArray(this.images) || this.images.length === 0) {
    return null;
  }
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage ? primaryImage.url : this.images[0].url;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.inventory && Array.isArray(this.inventory) && this.inventory.some(item => item.quantity > item.reserved);
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  return this.inventory && Array.isArray(this.inventory) ? this.inventory.reduce((total, item) => total + item.quantity, 0) : 0;
});

// Virtual for available stock
productSchema.virtual('availableStock').get(function() {
  return this.inventory && Array.isArray(this.inventory) ? this.inventory.reduce((total, item) => total + (item.quantity - item.reserved), 0) : 0;
});

// Method to check if product is available in specific size and color
productSchema.methods.isAvailable = function(size, color) {
  if (!this.inventory || !Array.isArray(this.inventory)) {
    return false;
  }
  const inventoryItem = this.inventory.find(item => 
    item.size === size && item.color === color
  );
  return inventoryItem && (inventoryItem.quantity - inventoryItem.reserved) > 0;
};

// Method to reserve stock
productSchema.methods.reserveStock = function(size, color, quantity) {
  if (!this.inventory || !Array.isArray(this.inventory)) {
    throw new Error('No inventory available');
  }
  const inventoryItem = this.inventory.find(item => 
    item.size === size && item.color === color
  );
  
  if (!inventoryItem || (inventoryItem.quantity - inventoryItem.reserved) < quantity) {
    throw new Error('Insufficient stock');
  }
  
  inventoryItem.reserved += quantity;
  return this.save();
};

// Method to release reserved stock
productSchema.methods.releaseStock = function(size, color, quantity) {
  if (!this.inventory || !Array.isArray(this.inventory)) {
    return;
  }
  const inventoryItem = this.inventory.find(item => 
    item.size === size && item.color === color
  );
  
  if (inventoryItem) {
    inventoryItem.reserved = Math.max(0, inventoryItem.reserved - quantity);
    return this.save();
  }
};

// Method to update rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true });
};

// Static method to find new products
productSchema.statics.findNew = function() {
      return this.find({ isNewArrival: true, isActive: true });
};

// Static method to find sale products
productSchema.statics.findSale = function() {
  return this.find({ isSale: true, isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to search products
productSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  });
};

module.exports = mongoose.model('Product', productSchema);
