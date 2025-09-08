const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const fixBrokenProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const products = await Product.find({ name: { $ne: 'Rochie Off Shade 2' } });
    console.log(`Found ${products.length} broken products to fix\n`);
    
    for (const product of products) {
      console.log(`=== Fixing Product: ${product.name} ===`);
      console.log(`Total images: ${product.images.length}`);
      console.log(`Colors: ${product.colors.length}`);
      
      if (product.colors.length !== 2) {
        console.log('❌ Expected 2 colors, skipping...');
        continue;
      }
      
      // Get all images that are not color representations
      const productImages = product.images.filter(img => 
        img.color === "null" || img.color === null || img.color === undefined
      );
      
      console.log(`Product images to distribute: ${productImages.length}`);
      
      // Split images between the two colors
      const half = Math.floor(productImages.length / 2);
      const firstHalf = productImages.slice(0, half);
      const secondHalf = productImages.slice(half);
      
      console.log(`First color (${product.colors[0].name}): ${firstHalf.length} images`);
      console.log(`Second color (${product.colors[1].name}): ${secondHalf.length} images`);
      
      // Update images with proper color tags
      const updatedImages = [];
      
      // First color images
      firstHalf.forEach(img => {
        updatedImages.push({
          ...img,
          color: product.colors[0].name,
          isColorRepresentation: false
        });
      });
      
      // Second color images
      secondHalf.forEach(img => {
        updatedImages.push({
          ...img,
          color: product.colors[1].name,
          isColorRepresentation: false
        });
      });
      
      // Update the product
      product.images = updatedImages;
      await product.save();
      
      console.log('✅ Product fixed successfully!');
      
      // Verify the fix
      const color1Images = product.images.filter(img => img.color === product.colors[0].name);
      const color2Images = product.images.filter(img => img.color === product.colors[1].name);
      
      console.log(`Verification - ${product.colors[0].name}: ${color1Images.length} images`);
      console.log(`Verification - ${product.colors[1].name}: ${color2Images.length} images`);
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    console.log('🎉 All broken products fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixBrokenProducts();
