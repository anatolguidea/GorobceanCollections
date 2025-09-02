const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0,
    min: [0, 'Category level cannot be negative']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
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
  },
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'color'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select type attributes
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  filters: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['range', 'checkbox', 'radio', 'color'],
      default: 'checkbox'
    },
    options: [String],
    min: Number,
    max: Number,
    step: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });

// Virtual for full path (breadcrumb)
categorySchema.virtual('fullPath').get(function() {
  if (!this.parent) {
    return this.name;
  }
  // This would need to be populated to work properly
  return `${this.parent.name} > ${this.name}`;
});

// Virtual for is parent category
categorySchema.virtual('isParent').get(function() {
  return this.children && this.children.length > 0;
});

// Virtual for is leaf category
categorySchema.virtual('isLeaf').get(function() {
  return !this.children || this.children.length === 0;
});

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set level based on parent
  if (this.parent) {
    this.level = 1; // This would need to be calculated recursively
  } else {
    this.level = 0;
  }
  
  next();
});

// Method to get all children recursively
categorySchema.methods.getAllChildren = async function() {
  const children = [];
  
  const getChildrenRecursive = async (categoryId) => {
    const childCategories = await this.constructor.find({ parent: categoryId });
    
    for (const child of childCategories) {
      children.push(child._id);
      await getChildrenRecursive(child._id);
    }
  };
  
  await getChildrenRecursive(this._id);
  return children;
};

// Method to get all products in this category and subcategories
categorySchema.methods.getAllProducts = async function() {
  const Product = mongoose.model('Product');
  const childCategoryIds = await this.getAllChildren();
  const allCategoryIds = [this._id, ...childCategoryIds];
  
  return Product.find({
    category: { $in: allCategoryIds },
    isActive: true
  });
};

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({
    category: this._id,
    isActive: true
  });
  
  this.productCount = count;
  return this.save();
};

// Static method to find root categories
categorySchema.statics.findRoots = function() {
  return this.find({ parent: null, isActive: true }).sort({ order: 1 });
};

// Static method to find featured categories
categorySchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true }).sort({ order: 1 });
};

// Static method to find categories by level
categorySchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true }).sort({ order: 1 });
};

// Static method to build category tree
categorySchema.statics.buildTree = async function() {
  const categories = await this.find({ isActive: true }).sort({ order: 1 });
  const categoryMap = new Map();
  const rootCategories = [];
  
  // Create a map of all categories
  categories.forEach(category => {
    categoryMap.set(category._id.toString(), {
      ...category.toObject(),
      children: []
    });
  });
  
  // Build the tree structure
  categories.forEach(category => {
    if (category.parent) {
      const parent = categoryMap.get(category.parent.toString());
      if (parent) {
        parent.children.push(categoryMap.get(category._id.toString()));
      }
    } else {
      rootCategories.push(categoryMap.get(category._id.toString()));
    }
  });
  
  return rootCategories;
};

module.exports = mongoose.model('Category', categorySchema);
