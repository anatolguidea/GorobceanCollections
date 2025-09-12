const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothingstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixImageOrder() {
  try {
    console.log('🔍 Finding products with images to reorder...');
    
    const products = await Product.find({ 
      'images.0': { $exists: true } 
    }).select('name images');
    
    console.log(`Found ${products.length} products with images`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      console.log(`\n📦 Processing product: ${product.name}`);
      
      // Group images by color
      const imagesByColor = {};
      
      product.images.forEach(image => {
        const color = image.color || 'general';
        if (!imagesByColor[color]) {
          imagesByColor[color] = [];
        }
        imagesByColor[color].push(image);
      });
      
      let needsUpdate = false;
      const newImages = [];
      
      // Process each color group
      for (const [color, images] of Object.entries(imagesByColor)) {
        console.log(`  🎨 Color: ${color} - ${images.length} images`);
        
        // Sort images by filename to match expected order
        const sortedImages = images.sort((a, b) => {
          // Extract filename from URL or alt text
          const getFilename = (img) => {
            if (img.url) {
              const urlParts = img.url.split('/');
              return urlParts[urlParts.length - 1];
            }
            if (img.alt) {
              return img.alt;
            }
            return '';
          };
          
          const filenameA = getFilename(a);
          const filenameB = getFilename(b);
          
          return filenameA.localeCompare(filenameB);
        });
        
        // Check if order changed
        const originalOrder = images.map(img => img.url || img.alt);
        const newOrder = sortedImages.map(img => img.url || img.alt);
        
        if (JSON.stringify(originalOrder) !== JSON.stringify(newOrder)) {
          console.log(`    ✅ Reordering images for ${color}`);
          console.log(`    Before: ${originalOrder.join(', ')}`);
          console.log(`    After:  ${newOrder.join(', ')}`);
          needsUpdate = true;
        } else {
          console.log(`    ⏭️  Order already correct for ${color}`);
        }
        
        newImages.push(...sortedImages);
      }
      
      if (needsUpdate) {
        // Update the product with reordered images
        await Product.findByIdAndUpdate(
          product._id,
          { images: newImages },
          { new: true }
        );
        
        console.log(`  ✅ Updated product: ${product.name}`);
        updatedCount++;
      } else {
        console.log(`  ⏭️  No changes needed for: ${product.name}`);
      }
    }
    
    console.log(`\n🎉 Image reordering complete!`);
    console.log(`📊 Updated ${updatedCount} out of ${products.length} products`);
    
  } catch (error) {
    console.error('❌ Error fixing image order:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
fixImageOrder();
