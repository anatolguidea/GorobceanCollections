'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  Minus, 
  Plus, 
  Share2, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  Ruler
} from 'lucide-react'
import { getImageUrl, getCloudinaryUrl } from '../utils/imageUtils'
import { api } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import { useNotification } from '../contexts/NotificationContext'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: Array<{ 
    url: string
    alt: string
    isPrimary?: boolean
    publicId?: string
    color?: string | null
    isColorRepresentation?: boolean
  }>
  sizes: string[]
  colors: Array<{ 
    name: string
    colorImage?: {
      url: string
      alt: string
      publicId?: string
    }
    inStock: boolean
  }>
  inventory: Array<{ 
    size: string
    color: string
    quantity: number
    reserved: number
  }>
  tags: string[]
  features: string[]
  care: string[]
  materials: string[]
  rating: { 
    average: number
    count: number
  }
  isNewArrival?: boolean
  isSale?: boolean
  isFeatured?: boolean
  inStock: boolean
  stockQuantity: number
  brand?: string
}

interface ProductDetailClientProps {
  productId: string
}

const ProductDetailClient = ({ productId }: ProductDetailClientProps) => {
  const { showNotification } = useNotification()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [displayedImages, setDisplayedImages] = useState<Array<{ 
    url: string
    alt: string
    isPrimary?: boolean
    publicId?: string
    color?: string | null
    isColorRepresentation?: boolean
  }>>([])
  const [viewingCustomers] = useState(Math.floor(Math.random() * 10) + 7)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [stockWarning, setStockWarning] = useState(false)
  const [mainImageReady, setMainImageReady] = useState(false)
  const [preparedMainUrl, setPreparedMainUrl] = useState<string | null>(null)

  // Function to get images for a specific color
  const getImagesForColor = (colorName: string) => {
    if (!product) return []
    
    // First try to find color-specific images (excluding color representation images)
    const colorImages = product.images.filter(img => 
      img.color === colorName && 
      img.isColorRepresentation !== true
    )
    
    if (colorImages.length > 0) {
      // Sort by isPrimary (primary first) then by creation order
      const sortedImages = colorImages.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1
        if (!a.isPrimary && b.isPrimary) return 1
        return 0
      })
      
      console.log(`=== Images for color "${colorName}" ===`);
      console.log('Total color-specific images:', sortedImages.length);
      sortedImages.forEach((img, i) => {
        console.log(`Image ${i+1}: ${img.alt} - ${img.url} (Primary: ${img.isPrimary})`);
      });
      
      return sortedImages
    }
    
    // If no color-specific images, return general images (color: null or undefined)
    const generalImages = product.images.filter(img => 
      (img.color === null || img.color === undefined) && 
      img.isColorRepresentation !== true
    )
    
    if (generalImages.length > 0) {
      // Sort by isPrimary (primary first) then by creation order
      const sortedImages = generalImages.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1
        if (!a.isPrimary && b.isPrimary) return 1
        return 0
      })
      
      console.log(`=== Using general images for color "${colorName}" ===`);
      console.log('Total general images:', sortedImages.length);
      
      return sortedImages
    }
    
    // Fallback: return all non-color-representation images
    const fallbackImages = product.images.filter(img => img.isColorRepresentation !== true)
    console.log(`=== Using fallback images for color "${colorName}" ===`);
    console.log('Total fallback images:', fallbackImages.length);
    
    return fallbackImages.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return 0
    })
  }

  // Function to get color representation image for a specific color
  const getColorRepresentationImage = (colorName: string) => {
    if (!product) return null
    
    return product.images.find(img => 
      img.color === colorName && 
      img.isColorRepresentation === true
    ) || null
  }

  // Update displayed images when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const imagesForColor = getImagesForColor(selectedColor)
      setDisplayedImages(imagesForColor)
      setActiveImageIndex(0) // Reset to first image when color changes
    }
  }, [selectedColor, product])

  // Set initial displayed images when product loads
  useEffect(() => {
    if (product && selectedColor) {
      const imagesForColor = getImagesForColor(selectedColor)
      setDisplayedImages(imagesForColor)
    }
  }, [product, selectedColor])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      
      try {
        setLoading(true)
        const response = await api.products.getById(productId)
        console.log('Product response:', response)
        
        if (response.success && response.data && response.data.data) {
          setProduct(response.data.data)
          // Set default selections
          if (response.data.data.sizes && response.data.data.sizes.length > 0) {
            setSelectedSize(response.data.data.sizes[0])
          }
          if (response.data.data.colors && response.data.data.colors.length > 0) {
            setSelectedColor(response.data.data.colors[0].name)
          }
          
          // Check stock warning
          const totalStock = response.data.data.inventory?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
          setStockWarning(totalStock <= 5 && totalStock > 0)
        } else {
          throw new Error(response.message || 'Failed to fetch product')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Compute primary and main image URL early to keep hooks before any returns
  const primaryImage = displayedImages.find(img => img.isPrimary) || displayedImages[0]
  const mainRawUrl = displayedImages[activeImageIndex]?.url || primaryImage?.url

  // Preload main image; render nothing until it's ready
  useEffect(() => {
    setMainImageReady(false)
    if (!mainRawUrl) {
      setPreparedMainUrl(null)
      return
    }
    const url = getCloudinaryUrl(mainRawUrl, {
      width: 800,
      height: 1200,
      quality: 'auto:best',
      format: 'auto',
      crop: 'limit'
    })
    setPreparedMainUrl(url)
    const img = new window.Image()
    img.onload = () => setMainImageReady(true)
    img.onerror = () => setMainImageReady(false)
    img.src = url
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [mainRawUrl])

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!displayedImages || displayedImages.length <= 1) return
      
      if (event.key === 'ArrowLeft') {
        setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : displayedImages.length - 1)
      } else if (event.key === 'ArrowRight') {
        setActiveImageIndex(activeImageIndex < displayedImages.length - 1 ? activeImageIndex + 1 : 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [displayedImages, activeImageIndex])

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) {
      showNotification({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please select both size and color before adding to cart.',
        duration: 3000
      })
      return
    }

    if (!isAuthenticated()) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    try {
      setAddingToCart(true)
      await api.cart.addItem({
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
      })
      
      // Dispatch cart update event
      window.dispatchEvent(new Event('cartUpdated'))
      
      // Show success notification with product details
      showNotification({
        type: 'success',
        title: 'Added to Cart!',
        message: 'Your item has been successfully added to your cart.',
        productDetails: {
          name: product.name,
          image: getCloudinaryUrl(displayedImages[0]?.url || product.images[0]?.url, {
            width: 96,
            height: 96,
            quality: 'auto:good',
            format: 'auto',
            crop: 'fill'
          }),
          price: product.price,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        },
        action: {
          label: 'View Cart',
          onClick: () => window.location.href = '/cart'
        },
        duration: 5000
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
      showNotification({
        type: 'error',
        title: 'Failed to Add Item',
        message: err instanceof Error ? err.message : 'Failed to add to cart. Please try again.',
        duration: 4000
      })
    } finally {
      setAddingToCart(false)
    }
  }


  const getAvailableStock = () => {
    if (!product || !selectedSize || !selectedColor) return 0
    const inventoryItem = product.inventory.find(
      item => item.size === selectedSize && item.color === selectedColor
    )
    return inventoryItem ? inventoryItem.quantity - inventoryItem.reserved : 0
  }

  const isSizeColorAvailable = (size: string, color: string) => {
    if (!product) return false
    const inventoryItem = product.inventory.find(
      item => item.size === size && item.color === color
    )
    return inventoryItem && inventoryItem.quantity > inventoryItem.reserved
  }

  if (loading) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="animate-pulse">
              <div className="relative h-[750px] overflow-hidden mb-6">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full bg-gray-200"></div>
              </div>
              <div className="flex justify-center space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 w-16"></div>
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="animate-pulse space-y-6">
              <div className="bg-gray-200 h-8 rounded w-3/4 mb-4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/4 mb-6"></div>
              <div className="bg-gray-200 h-12 rounded w-1/3 mb-6"></div>
              <div className="bg-gray-200 h-12 rounded w-full mb-6"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3 mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-light text-black mb-4 tracking-[0.1em]">Product Not Found</h1>
          <p className="text-red-600">{error || 'Product could not be loaded'}</p>
        </div>
      </main>
    )
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const availableStock = getAvailableStock()

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images - Left Section */}
          <div>
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="relative h-[750px] overflow-hidden group">
                {mainImageReady && preparedMainUrl ? (
                  <Image
                    key={preparedMainUrl}
                    src={preparedMainUrl}
                    alt={displayedImages[activeImageIndex]?.alt || primaryImage?.alt || product.name}
                    width={800}
                    height={1200}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full object-contain"
                    priority
                    quality={95}
                  />
                ) : null}
                {/* Navigation Arrows */}
                {displayedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : displayedImages.length - 1)}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 opacity-60 hover:opacity-100 group-hover:opacity-100 focus:outline-none"
                    >
                      <ChevronUp className="w-7 h-7 text-gray-800 rotate-[-90deg] drop-shadow" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(activeImageIndex < displayedImages.length - 1 ? activeImageIndex + 1 : 0)}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 opacity-60 hover:opacity-100 group-hover:opacity-100 focus:outline-none"
                    >
                      <ChevronDown className="w-7 h-7 text-gray-800 rotate-[-90deg] drop-shadow" />
                    </button>
                  </>
                )}
                
                {/* Sale Badge */}
                {product.isSale && discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
            </motion.div>


            {/* Thumbnail Images */}
            {displayedImages.length > 1 && (
              <div className="relative">
                <div className="flex justify-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {displayedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-16 overflow-hidden border-2 transition-all ${
                        index === activeImageIndex ? 'border-black scale-105' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={getCloudinaryUrl(image.url, {
                          width: 96,
                          height: 128,
                          quality: 'auto:good',
                          format: 'auto',
                          crop: 'fill'
                        })}
                        alt={image.alt || product.name}
                        width={96}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Image counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {activeImageIndex + 1} / {displayedImages.length}
                </div>
              </div>
            )}
          </div>

          {/* Product Details - Right Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Name */}
            <h1 className="text-3xl font-light text-black tracking-[0.1em]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-light text-black">
                €{product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  €{product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            {/* Stock Warning */}
            {stockWarning && (
              <div className="p-4">
                <p className="text-red-600 text-sm font-medium">
                  Please hurry! Only {availableStock} left in stock
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(availableStock / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-black font-medium">Color: {selectedColor}</span>
                </div>
                <div className="flex space-x-3">
                  {product.colors.map((color) => {
                    // Get color representation image first, then fallback to first product image
                    const colorRepresentationImage = getColorRepresentationImage(color.name)
                    const colorImages = getImagesForColor(color.name)
                    const colorThumbnail = colorRepresentationImage || colorImages[0]
                    
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-full transition-all relative overflow-hidden ${
                          selectedColor === color.name
                            ? 'border-4 border-black'
                            : 'border border-gray-300 hover:border-gray-400'
                        }`}
                        title={color.name}
                      >
                        {colorRepresentationImage ? (
                          <Image
                            src={getCloudinaryUrl(colorRepresentationImage.url, {
                              width: 96,
                              height: 96,
                              quality: 'auto:good',
                              format: 'auto',
                              crop: 'fill'
                            })}
                            alt={colorRepresentationImage.alt || `${product.name} in ${color.name}`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : colorThumbnail ? (
                          <Image
                            src={getCloudinaryUrl(colorThumbnail.url, {
                              width: 96,
                              height: 96,
                              quality: 'auto:good',
                              format: 'auto',
                              crop: 'fill'
                            })}
                            alt={colorThumbnail.alt || `${product.name} in ${color.name}`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium bg-gray-200 rounded-full">
                            {color.name}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-black font-medium">Size: {selectedSize}</span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    <Ruler className="w-4 h-4" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => {
                    const isAvailable = isSizeColorAvailable(size, selectedColor)
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded-lg transition-all font-light text-sm ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : isAvailable
                            ? 'border-gray-300 text-black hover:border-gray-400'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Guide Modal */}
            <AnimatePresence>
              {showSizeGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-black mb-2">Size Guide</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>S:</strong> Chest 36-38" | Waist 28-30"</p>
                    <p><strong>M:</strong> Chest 38-40" | Waist 30-32"</p>
                    <p><strong>L:</strong> Chest 40-42" | Waist 32-34"</p>
                    <p><strong>XL:</strong> Chest 42-44" | Waist 34-36"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h4 className="text-black font-medium mb-2">Measurements</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {product.materials.map((material, index) => (
                    <p key={index}>{material}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-black font-medium mb-3 block">Quantity:</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize || !selectedColor || addingToCart}
                className="flex-1 bg-black text-white py-4 px-8 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg tracking-[0.1em] flex items-center justify-center space-x-2"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
              <button className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Customer View Count */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{viewingCustomers} customers are viewing this product</span>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                <Truck className="w-5 h-5" />
                <span className="font-medium">Free Shipping</span>
              </div>
              <p className="text-xs text-gray-600">
                Free delivery for orders over <strong>500 EUR</strong> or the equivalent in the selected currency.
              </p>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4 tracking-[0.1em]">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-black mb-4 tracking-[0.1em]">
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Care Instructions */}
            {product.care && product.care.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-black mb-4 tracking-[0.1em]">
                  Care Instructions
                </h3>
                <ul className="space-y-2">
                  {product.care.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}

export default ProductDetailClient
