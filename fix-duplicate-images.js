const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const fixDuplicateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const product = await Product.findById('68b9864c0c25b6a8b8a07409');
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('=== FIXING DUPLICATE IMAGES ===');
    
    // Get color representation URLs
    const colorRepUrls = product.colors.map(c => c.colorImage?.url).filter(Boolean);
    console.log('Color rep URLs:', colorRepUrls);
    
    // Remove images that match color representation URLs
    const originalCount = product.images.length;
    product.images = product.images.filter(img => !colorRepUrls.includes(img.url));
    const removedCount = originalCount - product.images.length;
    
    console.log(`Removed ${removedCount} duplicate images`);
    console.log(`Remaining images: ${product.images.length}`);
    
    // Save the updated product
    await product.save();
    
    console.log('✅ Product updated successfully!');
    
    // Verify the fix
    console.log('\n=== VERIFICATION ===');
    const albImages = product.images.filter(img => img.color === 'Alb');
    console.log('Alb images after fix:', albImages.length);
    albImages.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.alt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixDuplicateImages();




