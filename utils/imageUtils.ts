// Utility function to get the correct image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return '/images/products/fashion.webp'
  }
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Get backend URL from environment or default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
  
  // If it's a relative path starting with /uploads, construct the full backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${backendUrl}${imagePath}`
  }
  
  // If it's just a filename, construct the full path
  if (!imagePath.startsWith('/')) {
    return `${backendUrl}/uploads/products/${imagePath}`
  }
  
  // For local images in public folder
  return imagePath
}

// Utility function to get the correct image URL for the current environment
export const getImageUrlForEnv = (imagePath: string): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
  
  if (!imagePath) return '/images/products/hero-product-image.jpg'
  
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a relative path starting with /uploads, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `${backendUrl}${imagePath}`
  }
  
  // If it's just a filename, construct the full path
  if (!imagePath.startsWith('/')) {
    return `${backendUrl}/uploads/products/${imagePath}`
  }
  
  // For local images in public folder
  return imagePath
}

// Function to check if image URL is valid
export const isValidImageUrl = (url: string): boolean => {
  return Boolean(url && url.length > 0 && url !== '/images/products/fashion.webp')
}

// Function to get optimized Cloudinary image URL
export const getCloudinaryUrl = (imagePath: string, options: {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'limit' | 'scale';
} = {}): string => {
  if (!imagePath) {
    return '/images/products/fashion.webp'
  }
  
  // If it's not a Cloudinary URL, return as is
  if (!imagePath.includes('res.cloudinary.com')) {
    return getImageUrl(imagePath)
  }
  
  // Build transformation parameters
  const transformations: string[] = []
  
  if (options.width || options.height) {
    const size = []
    if (options.width) size.push(`w_${options.width}`)
    if (options.height) size.push(`h_${options.height}`)
    if (options.crop) size.push(`c_${options.crop}`)
    if (size.length > 0) transformations.push(size.join(','))
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`)
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`)
  }
  
  // Insert transformations into Cloudinary URL
  if (transformations.length > 0) {
    const urlParts = imagePath.split('/')
    const insertIndex = urlParts.findIndex(part => part === 'upload') + 1
    urlParts.splice(insertIndex, 0, transformations.join('/'))
    return urlParts.join('/')
  }
  
  return imagePath
}

// Function to safely load an image with fallback (Client-side only)
export const loadImageWithFallback = (
  imagePath: string, 
  onSuccess?: (url: string) => void, 
  onError?: (error: string) => void
): string => {
  const imageUrl = getImageUrl(imagePath)
  
  // Only run in browser environment
  if (typeof window !== 'undefined') {
    // Create a temporary image element to test loading
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Image loaded successfully:', imageUrl)
      onSuccess?.(imageUrl)
    }
    
    img.onerror = () => {
      console.error('❌ Image failed to load:', imageUrl)
      const fallbackUrl = '/images/products/fashion.webp'
      console.log('🔄 Using fallback image:', fallbackUrl)
      onError?.(`Failed to load: ${imageUrl}`)
    }
    
    // Start loading the image
    img.src = imageUrl
  }
  
  return imageUrl
}
