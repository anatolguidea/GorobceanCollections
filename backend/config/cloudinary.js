const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Image upload configuration
const uploadConfig = {
  folder: 'clothing-store/products',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    { width: 800, height: 800, crop: 'limit' }, // Large size
    { quality: 'auto:good' }, // Automatic quality optimization
    { format: 'auto' } // Automatic format selection
  ]
};

// Generate different image sizes
const generateImageSizes = (publicId) => {
  const baseUrl = cloudinary.url(publicId);
  
  return {
    thumbnail: cloudinary.url(publicId, {
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    }),
    medium: cloudinary.url(publicId, {
      transformation: [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    }),
    large: cloudinary.url(publicId, {
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    }),
    original: baseUrl
  };
};

// Upload image to Cloudinary
const uploadImage = async (file, productId) => {
  try {
    // Create unique folder for each product
    const folder = `${uploadConfig.folder}/${productId}`;
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      transformation: uploadConfig.transformation,
      resource_type: 'image'
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      folder: folder
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results.every(result => result === true);
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  generateImageSizes,
  uploadConfig
};
