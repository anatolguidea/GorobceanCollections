const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const checkProductStructure = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const product = await Product.findById('68b9864c0c25b6a8b8a07409');
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('=== CURRENT PRODUCT STRUCTURE ===');
    console.log('Main images count:', product.images.length);
    console.log('Main images with isColorRepresentation:', product.images.filter(img => img.isColorRepresentation === true).length);
    console.log('Main images without isColorRepresentation:', product.images.filter(img => img.isColorRepresentation !== true).length);
    
    console.log('\n=== COLOR REPRESENTATION IMAGES ===');
    product.colors.forEach((color, i) => {
      console.log(`Color ${i+1} (${color.name}):`, !!color.colorImage);
    });
    
    console.log('\n=== ALB IMAGES ANALYSIS ===');
    const albImages = product.images.filter(img => img.color === 'Alb');
    console.log('Alb images in main array:', albImages.length);
    albImages.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.alt} - isColorRep: ${img.isColorRepresentation}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProductStructure();
