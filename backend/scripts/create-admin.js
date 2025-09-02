const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-store');
    console.log('✅ MongoDB Connected: localhost');

    console.log('👤 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@stylehub.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email: admin@stylehub.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    } else {
      // Create admin user
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@stylehub.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@stylehub.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
