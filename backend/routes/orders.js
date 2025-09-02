const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Get orders count and revenue (Admin only)
router.get('/count', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const count = await Order.countDocuments();
    
    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    res.json({
      success: true,
      data: { 
        count,
        totalRevenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching orders count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders count',
      error: error.message
    });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { customerDetails, items, subtotal, shipping, tax, total, paymentMethod, status } = req.body;

    // Validate required fields
    if (!customerDetails || !items || !subtotal || !total) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order information'
      });
    }

    // Create new order
    const order = new Order({
      user: req.user.userId,
      customerDetails,
      items,
      subtotal,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: status || 'pending'
    });

    await order.save();

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [] }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order by ID (for user)
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.userId
    }).populate('items.product', 'name images price description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Admin: Get all orders
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by customer name, email, or order number
    if (search) {
      query.$or = [
        { 'customerDetails.firstName': { $regex: search, $options: 'i' } },
        { 'customerDetails.lastName': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Admin: Get order by ID
router.get('/admin/:orderId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('user', 'email')
      .populate('items.product', 'name images price description category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching admin order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Admin: Update order status
router.put('/admin/:orderId/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Set delivery dates based on status
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    } else if (status === 'shipped') {
      // Estimate delivery in 5-7 days
      order.estimatedDelivery = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// Admin: Add admin notes
router.put('/admin/:orderId/notes', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { adminNotes } = req.body;

    if (!adminNotes) {
      return res.status(400).json({
        success: false,
        message: 'Admin notes are required'
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.adminNotes = adminNotes;
    await order.save();

    res.json({
      success: true,
      message: 'Admin notes updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating admin notes:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin notes',
      error: error.message
    });
  }
});

module.exports = router;
