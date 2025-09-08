const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const fixAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to fix`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n=== Fixing Product ${i + 1}: ${product.name} ===`);
      
      // Get color representation URLs
      const colorRepUrls = product.colors.map(c => c.colorImage?.url).filter(Boolean);
      console.log('Color rep URLs:', colorRepUrls.length);
      
      // Remove images that match color representation URLs
      const originalCount = product.images.length;
      product.images = product.images.filter(img => !colorRepUrls.includes(img.url));
      const removedCount = originalCount - product.images.length;
      
      console.log(`Removed ${removedCount} duplicate images`);
      console.log(`Remaining images: ${product.images.length}`);
      
      // Save the updated product
      await product.save();
      console.log('✅ Product updated successfully!');
    }
    
    console.log('\n🎉 All products fixed successfully!');
    
    // Verify the fix
    console.log('\n=== VERIFICATION ===');
    const allProducts = await Product.find({});
    for (const product of allProducts) {
      console.log(`\n${product.name}:`);
      console.log(`  Total images: ${product.images.length}`);
      console.log(`  Colors: ${product.colors.length}`);
      
      // Check for each color
      for (const color of product.colors) {
        const colorImages = product.images.filter(img => img.color === color.name);
        console.log(`  ${color.name}: ${colorImages.length} images`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAllProducts();
