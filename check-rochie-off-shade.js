const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const checkRochieOffShade = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Find the specific product
    const product = await Product.findOne({ name: 'Rochie Off Shade 2' });
    
    if (!product) {
      console.log('❌ Product not found');
      process.exit(1);
    }
    
    console.log(`\n=== Product: ${product.name} ===`);
    console.log(`Total images: ${product.images.length}`);
    console.log(`Colors: ${product.colors.length}`);
    
    // Check each color
    for (const color of product.colors) {
      console.log(`\n--- Color: ${color.name} ---`);
      console.log(`Color image: ${color.colorImage ? 'YES' : 'NO'}`);
      if (color.colorImage) {
        console.log(`  URL: ${color.colorImage.url}`);
      }
      
      const colorImages = product.images.filter(img => img.color === color.name);
      console.log(`Product images for this color: ${colorImages.length}`);
      
      colorImages.forEach((img, i) => {
        console.log(`  ${i+1}. ${img.alt} - ${img.url}`);
      });
    }
    
    // Check for duplicates
    console.log('\n=== DUPLICATE CHECK ===');
    const allUrls = product.images.map(img => img.url);
    const uniqueUrls = [...new Set(allUrls)];
    console.log(`Total images: ${allUrls.length}`);
    console.log(`Unique URLs: ${uniqueUrls.length}`);
    console.log(`Duplicates: ${allUrls.length - uniqueUrls.length}`);
    
    if (allUrls.length !== uniqueUrls.length) {
      console.log('\nDuplicate URLs found:');
      const urlCounts = {};
      allUrls.forEach(url => {
        urlCounts[url] = (urlCounts[url] || 0) + 1;
      });
      Object.entries(urlCounts).forEach(([url, count]) => {
        if (count > 1) {
          console.log(`  ${url} appears ${count} times`);
        }
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkRochieOffShade();




