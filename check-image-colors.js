const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const checkImageColors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const products = await Product.find({ name: { $ne: 'Rochie Off Shade 2' } });
    console.log(`Found ${products.length} products to check\n`);
    
    for (const product of products) {
      console.log(`=== Product: ${product.name} ===`);
      console.log(`Total images: ${product.images.length}`);
      
      // Check all images and their color tags
      product.images.forEach((img, i) => {
        console.log(`${i+1}. ${img.alt} - color: "${img.color}" - isColorRep: ${img.isColorRepresentation}`);
      });
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkImageColors();










