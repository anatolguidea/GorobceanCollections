'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Minus, Plus, Share2, Eye } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>
  sizes: string[]
  colors: Array<{ name: string; hex: string; inStock: boolean }>
  inventory: Array<{ size: string; color: string; quantity: number; reserved: number }>
  tags: string[]
  features: string[]
  care: string[]
  materials: string[]
  rating: { average: number; count: number }
  isNewArrival?: boolean
  isSale?: boolean
  isFeatured?: boolean
  inStock: boolean
  stockQuantity: number
}

const ProductClient = () => {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [viewingCustomers] = useState(Math.floor(Math.random() * 10) + 7)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5001/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        if (data.success) {
          setProduct(data.data)
          // Set default selections
          if (data.data.sizes.length > 0) {
            setSelectedSize(data.data.sizes[0])
          }
          if (data.data.colors.length > 0) {
            setSelectedColor(data.data.colors[0].name)
          }
        } else {
          throw new Error(data.message || 'Failed to fetch product')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) {
      alert('Please select size and color')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        }),
        credentials: 'include'
      })

      if (response.ok) {
        alert('Product added to cart!')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to add to cart')
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert('Failed to add to cart')
    }
  }

  const handleAddToWishlist = async () => {
    if (!product) return

    try {
      const response = await fetch('http://localhost:5001/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id
        }),
        credentials: 'include'
      })

      if (response.ok) {
        alert('Product added to wishlist!')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to add to wishlist')
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      alert('Failed to add to wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image skeleton */}
          <div className="animate-pulse">
            <div className="bg-gray-200 h-[700px] rounded-lg mb-6"></div>
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 w-20 rounded-lg"></div>
              ))}
            </div>
          </div>
          {/* Content skeleton */}
          <div className="animate-pulse space-y-8">
            <div className="bg-gray-200 h-8 rounded w-1/2 mb-4"></div>
            <div className="bg-gray-200 h-6 rounded w-1/4 mb-8"></div>
            <div className="bg-gray-200 h-12 rounded w-1/3 mb-8"></div>
            <div className="bg-gray-200 h-12 rounded w-full mb-8"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3 mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Product Not Found</h1>
          <p className="text-red-600">{error || 'Product could not be loaded'}</p>
        </div>
      </div>
    )
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Product Images - Left Section */}
          <div>
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="relative">
                <img
                  src={getImageUrl(primaryImage?.url || product.images[activeImageIndex]?.url)}
                  alt={primaryImage?.alt || product.name}
                  className="w-full h-[700px] object-cover rounded-lg"
                />
              </div>
            </motion.div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === activeImageIndex ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - Right Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Name */}
            <h1 className="text-3xl font-light text-black tracking-[0.1em]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-2xl font-light text-black">
              €{product.price.toFixed(2)}
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-black">Color: {selectedColor}</span>
                </div>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-black scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex || '#f3f4f6' }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <div className="w-full h-full rounded-full border-2 border-black flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-black">Size: {selectedSize}</span>
                </div>
                <div className="flex space-x-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border border-gray-300 rounded-lg transition-all font-light ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-lg">{quantity}</span>
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
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className="flex-1 bg-black text-white py-4 px-8 rounded-lg font-light hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg tracking-[0.1em]"
              >
                ADD TO CART
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
            <div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                <Truck className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
              <p className="text-xs text-gray-600">
                Free delivery for orders over <strong>500 EUR</strong> or the equivalent in the selected currency.
              </p>
            </div>

            {/* Complete Your Outfit Section */}
            <div>
              <h3 className="text-lg font-light text-black mb-4 tracking-[0.1em]">
                COMPLETE YOUR OUTFIT:
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div>
                  <p className="text-black font-light">Matching Top</p>
                  <p className="text-black">€45,00</p>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-light text-black mb-4 tracking-[0.1em]">
                Description
              </h3>
              <p className="text-black leading-relaxed">
                {product.description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductClient



