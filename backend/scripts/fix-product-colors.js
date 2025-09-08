const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const connectDB = require('../config/database');

const fixProductColors = async () => {
  try {
    await connectDB();
    console.log('🔧 Starting product color fix...');
    
    // Get the product
    const product = await Product.findById('68b9864c0c25b6a8b8a07409');
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('📦 Product found:', product.name);
    console.log('🎨 Current colors:', product.colors);
    console.log('🖼️ Current images count:', product.images.length);
    
    // Update the colors array to include colorImage data
    const updatedColors = product.colors.map((color, index) => {
      // Find the first image for this color (we'll use the first few images for each color)
      const startIndex = index * 5; // 5 images per color
      const endIndex = Math.min(startIndex + 5, product.images.length);
      const colorImages = product.images.slice(startIndex, endIndex);
      
      // Use the first image as the color representation
      const colorImage = colorImages.length > 0 ? {
        url: colorImages[0].url,
        alt: `${product.name} in ${color.name}`,
        publicId: colorImages[0].publicId,
        width: colorImages[0].width,
        height: colorImages[0].height,
        format: colorImages[0].format,
        size: colorImages[0].size,
        folder: colorImages[0].folder
      } : null;
      
      return {
        ...color.toObject(),
        colorImage
      };
    });
    
    // Update the images array to include color tags
    const updatedImages = product.images.map((image, index) => {
      // Determine which color this image belongs to
      const colorIndex = Math.floor(index / 5); // 5 images per color
      const color = updatedColors[colorIndex];
      
      return {
        ...image.toObject(),
        color: color ? color.name : null
      };
    });
    
    // Update the product
    product.colors = updatedColors;
    product.images = updatedImages;
    
    await product.save();
    
    console.log('✅ Product updated successfully!');
    console.log('🎨 Updated colors:', product.colors.map(c => ({ name: c.name, hasColorImage: !!c.colorImage })));
    console.log('🖼️ Updated images with colors:', product.images.map(img => ({ alt: img.alt, color: img.color })));
    
  } catch (error) {
    console.error('❌ Error fixing product colors:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

fixProductColors();




