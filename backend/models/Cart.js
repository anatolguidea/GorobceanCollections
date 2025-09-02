const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
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
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    originalPrice: Number,
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative']
    }
  }],
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'free'],
      default: 'standard'
    },
    estimatedDays: {
      type: Number,
      min: [1, 'Estimated days must be at least 1'],
      default: 5
    }
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative']
    },
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    }
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Cart expires in 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ isActive: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for savings amount
cartSchema.virtual('savings').get(function() {
  const originalTotal = this.items.reduce((total, item) => {
    return total + (item.originalPrice || item.price) * item.quantity;
  }, 0);
  return Math.max(0, originalTotal - this.subtotal);
});

// Virtual for free shipping eligibility
cartSchema.virtual('eligibleForFreeShipping').get(function() {
  return this.subtotal >= 100; // Free shipping over $100
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax (8% for example)
  this.tax = this.subtotal * 0.08;
  
  // Calculate shipping cost
  if (this.eligibleForFreeShipping) {
    this.shipping.cost = 0;
    this.shipping.method = 'free';
  } else {
    // Standard shipping cost
    this.shipping.cost = 10;
    this.shipping.method = 'standard';
  }
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping.cost - (this.discount.amount || 0);
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, size, color, quantity = 1) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      size,
      color,
      quantity,
      price: 0, // Will be populated when product is loaded
      originalPrice: 0
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, size, color, quantity) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, size, color) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );
  
  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.tax = 0;
  this.shipping.cost = 0;
  this.total = 0;
  this.discount = {};
  return this.save();
};

// Method to apply discount
cartSchema.methods.applyDiscount = function(code, amount, percentage) {
  this.discount.code = code;
  this.discount.amount = amount || 0;
  this.discount.percentage = percentage || 0;
  
  // Recalculate total with discount
  this.total = this.subtotal + this.tax + this.shipping.cost - this.discount.amount;
  
  return this.save();
};

// Method to remove discount
cartSchema.methods.removeDiscount = function() {
  this.discount = {};
  this.total = this.subtotal + this.tax + this.shipping.cost;
  return this.save();
};

// Method to update shipping method
cartSchema.methods.updateShippingMethod = function(method) {
  this.shipping.method = method;
  
  // Update shipping cost based on method
  switch (method) {
    case 'free':
      this.shipping.cost = 0;
      this.shipping.estimatedDays = 5;
      break;
    case 'standard':
      this.shipping.cost = this.eligibleForFreeShipping ? 0 : 10;
      this.shipping.estimatedDays = 5;
      break;
    case 'express':
      this.shipping.cost = 25;
      this.shipping.estimatedDays = 2;
      break;
    case 'overnight':
      this.shipping.cost = 50;
      this.shipping.estimatedDays = 1;
      break;
  }
  
  // Recalculate total
  this.total = this.subtotal + this.tax + this.shipping.cost - (this.discount.amount || 0);
  
  return this.save();
};

// Method to check if cart is empty
cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    tax: this.tax,
    shipping: this.shipping,
    discount: this.discount,
    total: this.total,
    savings: this.savings,
    eligibleForFreeShipping: this.eligibleForFreeShipping
  };
};

// Static method to find cart by user
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId, isActive: true });
};

// Static method to find expired carts
cartSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    isActive: true
  });
};

// Static method to clean expired carts
cartSchema.statics.cleanExpired = async function() {
  const expiredCarts = await this.findExpired();
  
  for (const cart of expiredCarts) {
    cart.isActive = false;
    await cart.save();
  }
  
  return expiredCarts.length;
};

// Static method to get cart statistics
cartSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalCarts: { $sum: 1 },
        totalItems: { $sum: { $size: '$items' } },
        averageItemsPerCart: { $avg: { $size: '$items' } },
        totalValue: { $sum: '$total' },
        averageCartValue: { $avg: '$total' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalCarts: 0,
      totalItems: 0,
      averageItemsPerCart: 0,
      totalValue: 0,
      averageCartValue: 0
    };
  }
  
  return stats[0];
};

module.exports = mongoose.model('Cart', cartSchema);
