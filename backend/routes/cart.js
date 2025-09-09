const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.product');

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        user: req.user.userId,
        items: []
      });
      await cart.save();
    }

    // Calculate totals (this is handled by the Cart model pre-save hook)
    await cart.save(); // This will trigger the totals calculation

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', [
  auth,
  body('productId').notEmpty().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId, quantity, size, color } = req.body;
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has inventory for the selected size and color
    const inventoryItem = product.inventory.find(
      item => item.size === size && item.color === color
    );
    
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Selected size/color combination is out of stock or insufficient quantity'
      });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
              item.size === size && 
              item.color === color
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity (replace, don't add)
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        size,
        color,
        quantity,
        price: product.price
      });
    }

    await cart.save(); // This will trigger totals calculation

    // Populate the product information after saving
    const populatedCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
});

// Update cart item quantity
router.patch('/items/:itemId', [
  auth,
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { quantity } = req.body;
    const itemId = req.params.itemId;
    
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check inventory availability
    const product = item.product;
    const inventoryItem = product.inventory.find(
      inv => inv.size === item.size && inv.color === item.color
    );
    
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${inventoryItem?.quantity || 0} items available in stock for the selected size and color`
      });
    }

    item.quantity = quantity;
    await cart.save();

    // Populate the product information after saving
    const populatedCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    console.log('Removing item with ID:', itemId, 'for user:', req.user.userId);
    
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      console.log('Cart not found for user:', req.user.userId);
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    console.log('Cart found with', cart.items.length, 'items');
    const item = cart.items.id(itemId);
    if (!item) {
      console.log('Item not found in cart. Available item IDs:', cart.items.map(i => i._id));
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    console.log('Item found, removing...');
    // Remove the item using splice
    const itemIndex = cart.items.findIndex(i => i._id.toString() === itemId);
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      console.log('Item removed successfully');
    } else {
      console.log('Item not found in cart items array');
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Populate the product information after saving
    const populatedCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error('Error removing item:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

// Get cart count (for header display)
router.get('/count', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    const itemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    res.json({
      success: true,
      data: { itemCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart count',
      error: error.message
    });
  }
});

module.exports = router;
