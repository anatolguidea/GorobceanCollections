const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');

// Database connection
const connectDB = require('../config/database');

// Clear all data function
const clearAllData = async () => {
  try {
    console.log('🗑️  Starting complete database cleanup...');
    
    // Clear all products
    const productResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${productResult.deletedCount} products`);
    
    // Clear all orders
    const orderResult = await Order.deleteMany({});
    console.log(`✅ Deleted ${orderResult.deletedCount} orders`);
    
    // Clear all carts
    const cartResult = await Cart.deleteMany({});
    console.log(`✅ Deleted ${cartResult.deletedCount} carts`);
    
    // Keep only admin and test user accounts
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
    
    console.log('\n🎉 Complete database cleanup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Products deleted: ${productResult.deletedCount}`);
    console.log(`   Orders deleted: ${orderResult.deletedCount}`);
    console.log(`   Carts deleted: ${cartResult.deletedCount}`);
    console.log(`   Users kept: ${usersToKeep.length}`);
    console.log(`   Other users deleted: ${otherUsers.deletedCount}`);
    console.log('\n🔑 Remaining accounts:');
    console.log('   Email: admin@stylehub.com (Admin)');
    console.log('   Email: john.doe@example.com (User)');
    console.log('   Email: jane.smith@example.com (User)');
    console.log('\n✨ Database is now clean and ready for testing!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Run cleanup
const runCleanup = async () => {
  try {
    await connectDB();
    await clearAllData();
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

module.exports = { clearAllData };




