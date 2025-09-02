const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Database connection
const connectDB = require('../config/database');

// Fix admin user function
const fixAdminUser = async () => {
  try {
    console.log('🔧 Checking admin user...');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@stylehub.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   First Name: ${adminUser.firstName}`);
    console.log(`   Last Name: ${adminUser.lastName}`);
    
    // Check if role needs to be fixed
    if (adminUser.role !== 'admin') {
      console.log('🔄 Fixing admin role...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Admin role fixed!');
    } else {
      console.log('✅ Admin role is already correct');
    }
    
    // Verify the fix
    const updatedAdmin = await User.findOne({ email: 'admin@stylehub.com' });
    console.log(`\n🔍 Verification - Role: ${updatedAdmin.role}`);
    
    if (updatedAdmin.role === 'admin') {
      console.log('🎉 Admin user is properly configured!');
    } else {
      console.log('❌ Admin role fix failed!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
    process.exit(1);
  }
};

// Run fix
const runFix = async () => {
  try {
    await connectDB();
    await fixAdminUser();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run fix:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runFix();
}

module.exports = { fixAdminUser };





