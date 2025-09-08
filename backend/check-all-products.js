const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const checkAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`=== Product ${i + 1}: ${product.name} ===`);
      console.log(`Total images: ${product.images.length}`);
      console.log(`Colors: ${product.colors.length}`);
      
      // Check each color
      for (const color of product.colors) {
        console.log(`\n--- Color: ${color.name} ---`);
        console.log(`Color image: ${color.colorImage ? 'YES' : 'NO'}`);
        
        const colorImages = product.images.filter(img => img.color === color.name);
        console.log(`Product images for this color: ${colorImages.length}`);
        
        if (colorImages.length === 0) {
          console.log('❌ NO PRODUCT IMAGES FOR THIS COLOR!');
        }
      }
      
      // Check for duplicates
      const allUrls = product.images.map(img => img.url);
      const uniqueUrls = [...new Set(allUrls)];
      const duplicates = allUrls.length - uniqueUrls.length;
      
      if (duplicates > 0) {
        console.log(`\n❌ DUPLICATES FOUND: ${duplicates}`);
        const urlCounts = {};
        allUrls.forEach(url => {
          urlCounts[url] = (urlCounts[url] || 0) + 1;
        });
        Object.entries(urlCounts).forEach(([url, count]) => {
          if (count > 1) {
            console.log(`  ${url} appears ${count} times`);
          }
        });
      } else {
        console.log('\n✅ No duplicates');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAllProducts();
