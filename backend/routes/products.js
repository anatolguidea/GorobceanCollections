const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { cacheConfigs, invalidateCache } = require('../middleware/cache');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteImage, deleteMultipleImages } = require('../config/cloudinary');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer to accept any field names (for imageData fields)
const uploadAny = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all products with filtering and pagination
router.get('/', cacheConfigs.products, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      sizes,
      colors,
      featured,
      isNewArrival,
      isSale,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true }; // Only show active products to users
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Add sizes filtering
    if (sizes) {
      const sizeArray = sizes.split(',').map(size => size.trim());
      filter.sizes = { $in: sizeArray };
    }
    
    // Add colors filtering
    if (colors) {
      const colorArray = colors.split(',').map(color => color.trim());
      filter['colors.name'] = { $in: colorArray };
    }
    
    // Add boolean filters
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    if (isNewArrival === 'true') {
      filter.isNewArrival = true;
    }
    
    if (isSale === 'true') {
      filter.isSale = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name slug'),
      Product.countDocuments(filter)
    ]);

    // Add inStock status and stockQuantity to each product
    const productsWithStock = products.map(product => {
      const productData = product.toObject();
      productData.inStock = product.inventory.some(item => item.quantity > item.reserved);
      productData.stockQuantity = product.inventory.reduce((total, item) => total + item.quantity, 0);
      return productData;
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products: productsWithStock,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
});

// Get single product by ID
router.get('/:id', cacheConfigs.product, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Add inStock status and stockQuantity to the response
    const productData = product.toObject();
    productData.inStock = product.inventory.some(item => item.quantity > item.reserved);
    productData.stockQuantity = product.inventory.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product',
      error: error.message 
    });
  }
});

// Get featured products
router.get('/featured/featured', cacheConfigs.featuredProducts, async (req, res) => {
  try {
    const featuredProducts = await Product.find({ 
      isFeatured: true,
      isActive: true
    })
    .limit(8)
    .populate('category', 'name slug');

    // Add inStock status and stockQuantity to each product
    const productsWithStock = featuredProducts.map(product => {
      const productData = product.toObject();
      productData.inStock = product.inventory.some(item => item.quantity > item.reserved);
      productData.stockQuantity = product.inventory.reduce((total, item) => total + item.quantity, 0);
      return productData;
    });

    res.json({
      success: true,
      data: productsWithStock
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch featured products',
      error: error.message 
    });
  }
});

// Create new product with file uploads (Admin only)
router.post('/upload', [
  auth,
  uploadAny.any() // Accept any field names for images and imageData
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    // Get product data from individual fields
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      category: req.body.category,
      subcategory: req.body.subcategory,
      sizes: [],
      colors: [], // Color variants array
      inventory: [],
      tags: [],
      features: [],
      care: [],
      materials: [],
      isNewArrival: req.body.isNewArrival === 'true',
      isSale: req.body.isSale === 'true',
      isFeatured: req.body.isFeatured === 'true',
      isActive: req.body.isActive === 'true',
      salePercentage: req.body.salePercentage ? parseInt(req.body.salePercentage) : undefined
    };
    
    // Validate and parse array fields safely
    try {
      if (req.body.sizes) productData.sizes = JSON.parse(req.body.sizes);
      if (req.body.colors) productData.colors = JSON.parse(req.body.colors);
      if (req.body.inventory) productData.inventory = JSON.parse(req.body.inventory);
      if (req.body.tags) productData.tags = JSON.parse(req.body.tags);
      if (req.body.features) productData.features = JSON.parse(req.body.features);
      if (req.body.care) productData.care = JSON.parse(req.body.care);
      if (req.body.materials) productData.materials = JSON.parse(req.body.materials);
    } catch (parseError) {
      console.error('Error parsing array fields:', parseError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format for array fields' 
      });
    }
    
    // Debug logging
    console.log('=== UPLOAD DEBUG START ===');
    console.log('Upload endpoint - Files received:', req.files?.length || 0);
    console.log('Upload endpoint - Body keys:', Object.keys(req.body));
    console.log('Upload endpoint - Product data:', productData);
    console.log('Upload endpoint - All body data:', req.body);
    console.log('=== UPLOAD DEBUG END ===');
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Process uploaded images with Cloudinary
    const images = [];
    const processedColors = new Map(); // Track processed colors for colorImage assignment
    
    if (req.files && req.files.length > 0) {
      try {
        // Filter out only the actual image files (not imageData fields)
        const imageFiles = req.files.filter(file => file.fieldname === 'images');
        
        // Upload each image to Cloudinary
        for (let index = 0; index < imageFiles.length; index++) {
          const file = imageFiles[index];
          
          // Get image data for this specific file - handle both array and individual field formats
          let imageData = {};
          if (req.body.imageData && Array.isArray(req.body.imageData) && req.body.imageData[index]) {
            // Handle array format
            imageData = JSON.parse(req.body.imageData[index]);
          } else {
            // Handle individual field format
            const imageDataKey = `imageData[${index}]`;
            imageData = req.body[imageDataKey] ? JSON.parse(req.body[imageDataKey]) : {};
          }
          
          console.log(`=== IMAGE ${index} PROCESSING ===`);
          console.log(`File: ${file.originalname}`);
          console.log(`Image data array:`, req.body.imageData);
          console.log(`Parsed image data:`, imageData);
          console.log(`Color:`, imageData.color);
          console.log(`Is color representation:`, imageData.isColorRepresentation);
          
          // Generate a temporary product ID for folder organization
          const tempProductId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Upload to Cloudinary
          const cloudinaryResult = await uploadImage(file, tempProductId);
          
          const imageObj = {
            url: cloudinaryResult.url,
            alt: imageData.alt || file.originalname,
            isPrimary: imageData.isPrimary || false,
            color: imageData.color,
            publicId: cloudinaryResult.publicId,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            size: cloudinaryResult.size,
            folder: cloudinaryResult.folder
          };
          
          images.push(imageObj);
          
          // If this is a color representation image, store it for the color
          if (imageData.isColorRepresentation && imageData.color) {
            processedColors.set(imageData.color, imageObj);
          }
        }
        
        // Ensure at least one product image (not color representation) is primary
        if (images.length > 0) {
          const hasPrimaryProductImage = images.some(img => img.isPrimary && !img.isColorRepresentation);
          if (!hasPrimaryProductImage) {
            // Find the first product image (not color representation) and make it primary
            const firstProductImage = images.find(img => !img.isColorRepresentation);
            if (firstProductImage) {
              firstProductImage.isPrimary = true;
            } else {
              // Fallback: make the first image primary if no product images exist
              images[0].isPrimary = true;
            }
          }
        }
        
        // Clean up temporary files
        imageFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        
      } catch (uploadError) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        
        // Clean up any uploaded files on error
        imageFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images to Cloudinary',
          error: uploadError.message
        });
      }
    }
    
        // Update colors with their colorImage data
        if (productData.colors && productData.colors.length > 0) {
          console.log('=== COLOR PROCESSING DEBUG ===');
          console.log('Product colors:', productData.colors.map(c => c.name));
          console.log('Processed colors map:', Array.from(processedColors.keys()));
          
          productData.colors = productData.colors.map(color => {
            const colorImage = processedColors.get(color.name);
            console.log(`Looking for color image for "${color.name}":`, colorImage ? 'FOUND' : 'NOT FOUND');
            
            if (!colorImage) {
              throw new Error(`Color representation image is required for color: ${color.name}. Available colors with images: ${Array.from(processedColors.keys()).join(', ')}`);
            }
            return {
              ...color,
              colorImage: colorImage
            };
          });
        }

    // Create product object with simplified structure
    const product = new Product({
      ...productData,
      images: images
    });

    await product.save();

    // Invalidate product caches
    invalidateCache.product(product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error creating product with uploads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create product',
      error: error.message 
    });
  }
});

// Create new product (Admin only) - JSON only
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sizes').isArray({ min: 1 }).withMessage('At least one size is required'),
  body('colors').isArray({ min: 1 }).withMessage('At least one color is required'),
  body('inventory').isArray().withMessage('Inventory must be an array')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const product = new Product(req.body);
    await product.save();

    // Invalidate product caches
    invalidateCache.product(product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create product',
      error: error.message 
    });
  }
});

// Update product (Admin only)
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const productId = req.params.id;
    const updateData = { ...req.body };
    
    // Parse JSON fields that come as strings
    if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes);
    if (updateData.colors) updateData.colors = JSON.parse(updateData.colors);
    if (updateData.inventory) updateData.inventory = JSON.parse(updateData.inventory);
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.features) updateData.features = JSON.parse(updateData.features);
    if (updateData.care) updateData.care = JSON.parse(updateData.care);
    if (updateData.materials) updateData.materials = JSON.parse(updateData.materials);
    
    // Parse boolean fields
    if (updateData.isNewArrival !== undefined) updateData.isNewArrival = updateData.isNewArrival === 'true';
    if (updateData.isSale !== undefined) updateData.isSale = updateData.isSale === 'true';
    if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true';
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true';
    
    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.salePercentage) updateData.salePercentage = parseInt(updateData.salePercentage);
    
    // Validate and clean images if they exist
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.filter(img => 
        img && img.url && 
        !img.url.startsWith('blob:') && 
        (img.url.startsWith('/uploads/') || img.url.startsWith('http'))
      );
      
      // Ensure at least one image is primary
      if (updateData.images.length > 0 && !updateData.images.some(img => img.isPrimary)) {
        updateData.images[0].isPrimary = true;
      }
      
      console.log('🔍 Regular update - Cleaned images:', updateData.images.length);
    }

    const product = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product',
      error: error.message 
    });
  }
});

// Update product with images (Admin only)
router.put('/:id/with-images', [
  auth,
  uploadAny.any(), // Accept any field names for images and imageData
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const productId = req.params.id;
    const updateData = { ...req.body };
    
    // Parse JSON fields that come as strings
    if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes);
    if (updateData.colors) updateData.colors = JSON.parse(updateData.colors);
    if (updateData.inventory) updateData.inventory = JSON.parse(updateData.inventory);
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.features) updateData.features = JSON.parse(updateData.features);
    if (updateData.care) updateData.care = JSON.parse(updateData.care);
    if (updateData.materials) updateData.materials = JSON.parse(updateData.materials);
    
    // Parse boolean fields
    if (updateData.isNewArrival !== undefined) updateData.isNewArrival = updateData.isNewArrival === 'true';
    if (updateData.isSale !== undefined) updateData.isSale = updateData.isSale === 'true';
    if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true';
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true';
    
    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.salePercentage) updateData.salePercentage = parseInt(updateData.salePercentage);

    // Handle image uploads with the same logic as create route
    if (req.files && req.files.length > 0) {
      try {
        // Filter out only the actual image files (not imageData fields)
        const imageFiles = req.files.filter(file => file.fieldname === 'images');
        
        // Process uploaded images with Cloudinary
        const images = [];
        for (let index = 0; index < imageFiles.length; index++) {
          const file = imageFiles[index];
          
          // Get image data for this specific file - handle both array and individual field formats
          let imageData = {};
          if (req.body.imageData && Array.isArray(req.body.imageData) && req.body.imageData[index]) {
            // Handle array format
            imageData = JSON.parse(req.body.imageData[index]);
          } else {
            // Handle individual field format
            const imageDataKey = `imageData[${index}]`;
            imageData = req.body[imageDataKey] ? JSON.parse(req.body[imageDataKey]) : {};
          }
          
          // Generate a temporary product ID for folder organization
          const tempProductId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Upload to Cloudinary
          const cloudinaryResult = await uploadImage(file, tempProductId);
          
          images.push({
            url: cloudinaryResult.url,
            alt: imageData.alt || file.originalname,
            isPrimary: imageData.isPrimary || false,
            color: imageData.color || null,
            isColorRepresentation: imageData.isColorRepresentation === true,
            publicId: cloudinaryResult.publicId,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            size: cloudinaryResult.size,
            folder: cloudinaryResult.folder
          });
        }
        
        // Process color representation images
        const processedColors = updateData.colors.map(color => {
          const colorRepresentationImage = images.find(img => 
            img.color === color.name && img.isColorRepresentation
          );
          
          if (!colorRepresentationImage) {
            throw new Error(`Color representation image is required for color: ${color.name}`);
          }
          
          return {
            name: color.name,
            inStock: color.inStock,
            colorImage: {
              url: colorRepresentationImage.url,
              alt: colorRepresentationImage.alt,
              publicId: colorRepresentationImage.publicId,
              width: colorRepresentationImage.width,
              height: colorRepresentationImage.height,
              format: colorRepresentationImage.format,
              size: colorRepresentationImage.size,
              folder: colorRepresentationImage.folder
            }
          };
        });

        // Filter out color representation images from main images array
        const productImages = images.filter(img => img.isColorRepresentation !== true);
        
        // Additional safety: Remove any duplicate URLs from product images
        const uniqueProductImages = [];
        const seenUrls = new Set();
        
        for (const img of productImages) {
          if (!seenUrls.has(img.url)) {
            seenUrls.add(img.url);
            uniqueProductImages.push(img);
          }
        }
        
        // Ensure at least one image is primary
        if (uniqueProductImages.length > 0 && !uniqueProductImages.some(img => img.isPrimary)) {
          uniqueProductImages[0].isPrimary = true;
        }
        
        // Update the product data
        updateData.colors = processedColors;
        updateData.images = uniqueProductImages;
        
        // Clean up temporary files
        imageFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        
      } catch (uploadError) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        
        // Clean up any uploaded files on error
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images to Cloudinary',
          error: uploadError.message
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating product with images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product',
      error: error.message 
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Delete all images from Cloudinary before deleting the product
    if (product.images && product.images.length > 0) {
      const publicIds = product.images
        .filter(img => img.publicId)
        .map(img => img.publicId);
      
      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
          console.log(`Deleted ${publicIds.length} images from Cloudinary for product ${product._id}`);
        } catch (cloudinaryError) {
          console.error('Error deleting images from Cloudinary:', cloudinaryError);
          // Continue with product deletion even if image deletion fails
        }
      }
    }

    // Delete the product from database
    await Product.findByIdAndDelete(req.params.id);

    // Invalidate product caches
    invalidateCache.product(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product',
      error: error.message 
    });
  }
});

// Delete product image (Admin only)
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { id, imageId } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Find the image to delete
    const imageIndex = product.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    const imageToDelete = product.images[imageIndex];

    // Delete image from Cloudinary if it has a publicId
    if (imageToDelete.publicId) {
      try {
        await deleteImage(imageToDelete.publicId);
        console.log(`Deleted image from Cloudinary: ${imageToDelete.publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove the image from the array
    product.images.splice(imageIndex, 1);
    
    // If we deleted the primary image and there are other images, make the first one primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: product
    });

  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image',
      error: error.message 
    });
  }
});

// Get random products
router.get('/random/random', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    // Get random products using MongoDB's $sample aggregation
    const randomProducts = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: parseInt(limit) } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryData', 0] }
        }
      },
      {
        $project: {
          categoryData: 0
        }
      }
    ]);

    // Add inStock status and stockQuantity to each product
    const productsWithStock = randomProducts.map(product => {
      const productData = product;
      productData.inStock = product.inventory.some(item => item.quantity > item.reserved);
      productData.stockQuantity = product.inventory.reduce((total, item) => total + item.quantity, 0);
      return productData;
    });

    res.json({
      success: true,
      data: {
        products: productsWithStock
      }
    });

  } catch (error) {
    console.error('Error fetching random products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch random products',
      error: error.message 
    });
  }
});

module.exports = router;
