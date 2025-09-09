const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./backend/models/Product');

const checkProductData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const product = await Product.findById('68b9864c0c25b6a8b8a07409');
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('=== PRODUCT DATA ===');
    console.log('Name:', product.name);
    console.log('Colors:', product.colors.map(c => ({ 
      name: c.name, 
      hasColorImage: !!c.colorImage,
      colorImageUrl: c.colorImage?.url || 'none'
    })));
    console.log('Images count:', product.images.length);
    console.log('Images with colors:', product.images.map(img => ({ 
      alt: img.alt, 
      color: img.color, 
      isColorRepresentation: img.isColorRepresentation 
    })));
    
    // Check for duplicates
    const colorRepImages = product.images.filter(img => img.isColorRepresentation);
    console.log('Color representation images in main array:', colorRepImages.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProductData();









