const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');

// Get users count (Admin only)
router.get('/count', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const count = await User.countDocuments();
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching users count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users count',
      error: error.message 
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('address').optional().isObject().withMessage('Address must be an object')
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

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    user.updatedAt = new Date();

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Update user preferences
router.put('/preferences', [
  auth,
  body('newsletter').optional().isBoolean().withMessage('Newsletter preference must be boolean'),
  body('marketing').optional().isBoolean().withMessage('Marketing preference must be boolean'),
  body('size').optional().isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Valid size is required'),
  body('favoriteCategories').optional().isArray().withMessage('Favorite categories must be an array')
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

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (req.body.newsletter !== undefined) user.preferences.newsletter = req.body.newsletter;
    if (req.body.marketing !== undefined) user.preferences.marketing = req.body.marketing;
    if (req.body.size) user.preferences.size = req.body.size;
    if (req.body.favoriteCategories) user.preferences.favoriteCategories = req.body.favoriteCategories;
    user.updatedAt = new Date();

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
});

// Create new user (Admin only)
router.post('/', [
  adminAuth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['user', 'admin']).withMessage('Valid role is required')
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

    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get all users (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (status !== undefined) {
      query.isActive = (status === 'true');
    }

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password'); // Exclude password from response

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers: totalUsers,
          hasNextPage: page < Math.ceil(totalUsers / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user by ID (Admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user (Admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Valid role is required'),
  body('isActive').optional().isBoolean().withMessage('Active status must be boolean')
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

    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    user.updatedAt = new Date();

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      userGrowth: {
        thisMonth: Math.floor(Math.random() * 50) + 10, // Mock data
        lastMonth: Math.floor(Math.random() * 50) + 10,
        percentageChange: Math.floor(Math.random() * 20) - 10
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;
