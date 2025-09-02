const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const User = require('../models/User');

// Database connection
const connectDB = require('../config/database');

// Clear products function
const clearProducts = async () => {
  try {
    console.log('🗑️  Starting product cleanup...');
    
    // Clear all products
    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products`);
    
    // Keep only admin and user accounts
    const usersToKeep = await User.find({ 
      email: { 
        $in: ['admin@stylehub.com', 'john.doe@example.com', 'jane.smith@example.com'] 
      } 
    });
    
    console.log(`✅ Kept ${usersToKeep.length} user accounts:`);
    usersToKeep.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    // Delete any other users
    const otherUsers = await User.deleteMany({ 
      email: { 
        $nin: ['admin@stylehub.com', 'john.doe@example.com', 'jane.smith@example.com'] 
      } 
    });
    
    if (otherUsers.deletedCount > 0) {
      console.log(`🗑️  Deleted ${otherUsers.deletedCount} other user accounts`);
    }
    
    console.log('\n🎉 Product cleanup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Products deleted: ${result.deletedCount}`);
    console.log(`   Users kept: ${usersToKeep.length}`);
    console.log(`   Other users deleted: ${otherUsers.deletedCount}`);
    console.log('\n🔑 Remaining accounts:');
    console.log('   Email: admin@stylehub.com (Admin)');
    console.log('   Email: john.doe@example.com (User)');
    console.log('   Email: jane.smith@example.com (User)');
    
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
};

// Run cleanup
const runCleanup = async () => {
  try {
    await connectDB();
    await clearProducts();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run cleanup:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runCleanup();
}

module.exports = { clearProducts };
