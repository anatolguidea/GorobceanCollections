const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    console.log('Wishlist GET request received:', {
      userId: req.user.userId,
      headers: req.headers
    });

    let wishlist = await Wishlist.findOne({ user: req.user.userId })
      .populate('items.product', 'name price images category rating');

    console.log('Wishlist query result:', wishlist);

    if (!wishlist) {
      // Create empty wishlist if none exists
      console.log('No wishlist found, creating new one for user:', req.user.userId);
      wishlist = new Wishlist({
        user: req.user.userId,
        items: []
      });
      await wishlist.save();
      console.log('New wishlist created and saved');
    }

    console.log('Sending wishlist response:', {
      success: true,
      itemCount: wishlist.items.length,
      items: wishlist.items.map(item => ({
        productId: item.product._id || item.product,
        productName: item.product.name || 'Unknown'
      }))
    });

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
});

// Add item to wishlist
router.post('/add', [
  auth,
  body('productId').notEmpty().withMessage('Valid product ID is required')
], async (req, res) => {
  try {
    console.log('Wishlist add request received:', {
      userId: req.user.userId,
      body: req.body,
      headers: req.headers
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId } = req.body;
    console.log('Processing productId:', productId);
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    console.log('Product found:', product.name);

    let wishlist = await Wishlist.findOne({ user: req.user.userId });
    console.log('Existing wishlist:', wishlist ? `Found with ${wishlist.items.length} items` : 'Not found');
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.userId, items: [] });
      console.log('Created new wishlist for user:', req.user.userId);
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      console.log('Product already in wishlist');
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add new item
    wishlist.items.push({
      product: productId,
      addedAt: new Date()
    });

    console.log('Adding item to wishlist, new count:', wishlist.items.length);
    await wishlist.save();
    console.log('Wishlist saved successfully');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.userId });
    
    if (!wishlist) {
      return res.json({
        success: true,
        data: { isInWishlist: false }
      });
    }

    const isInWishlist = wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist',
      error: error.message
    });
  }
});

module.exports = router;
