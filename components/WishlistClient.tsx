'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, Star, ArrowLeft, Search, Filter, Grid, List, Eye } from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '../utils/imageUtils'
import { isAuthenticated, getToken } from '../utils/auth'

interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    originalPrice?: number
    images: Array<{ url: string; alt: string }>
    category: string
    rating: { average: number; count: number }
    sizes: string[]
    colors: Array<{ name: string; hex: string }>
  }
  addedAt: string
}

const WishlistClient = () => {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest')
  
  // Authentication state
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const token = getToken()
      setIsUserAuthenticated(authenticated)
      setUserToken(token)
    }

    // Check immediately
    checkAuth()
    
    // Listen for authentication changes
    const handleStorageChange = () => {
      checkAuth()
    }

    // Also listen for custom events
    const handleAuthEvent = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthEvent)
    }
  }, [])

  // Check authentication and fetch wishlist
  useEffect(() => {
    // Don't redirect if we're already checking authentication
    if (isUserAuthenticated === undefined) return
    
    // If we're already authenticated and have a token, just fetch the wishlist
    if (isUserAuthenticated && userToken) {
      fetchWishlist()
      return
    }
    
    if (!isUserAuthenticated) {
      // Check if we have a token in localStorage before redirecting
      const token = localStorage.getItem('token')
      if (token) {
        setUserToken(token)
        setIsUserAuthenticated(true)
        return
      }
      
      // No token found, redirect to login
      router.push('/login?redirect=/wishlist')
      return
    }
  }, [isUserAuthenticated, userToken, router])

  const fetchWishlist = async () => {
    if (!userToken) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWishlistItems(data.data.items || [])
        }
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token')
        setIsUserAuthenticated(false)
        router.push('/login?redirect=/wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    if (!userToken) return

    try {
      setRemovingItem(itemId)
      const response = await fetch(`http://localhost:5001/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item._id !== itemId))
        // Dispatch custom event to update wishlist count in header
        window.dispatchEvent(new Event('wishlistUpdated'))
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
    } finally {
      setRemovingItem(null)
    }
  }

  const addToCart = async (productId: string, size: string, color: string) => {
    if (!userToken) {
      router.push('/login?redirect=/wishlist')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          productId,
          size,
          color,
          quantity: 1
        })
      })

      if (response.ok) {
        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'))
        // Remove from wishlist after adding to cart
        removeFromWishlist(productId)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // Filter and sort wishlist items
  const filteredAndSortedItems = wishlistItems
    .filter(item => 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        case 'price-low':
          return a.product.price - b.product.price
        case 'price-high':
          return b.product.price - a.product.price
        case 'name':
          return a.product.name.localeCompare(b.product.name)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!isUserAuthenticated) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-black mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">Sign in to view and manage your wishlist</p>
            <Link
              href="/login?redirect=/wishlist"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-black mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">Start adding items to your wishlist to see them here</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
          <h1 className="text-3xl lg:text-4xl font-light text-black tracking-[0.1em]">
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border transition-colors ${
                viewMode === 'grid' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border transition-colors ${
                viewMode === 'list' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Wishlist Items */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or browse our collection</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            <AnimatePresence>
              {filteredAndSortedItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white border border-gray-200 group ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`bg-gray-100 overflow-hidden ${
                    viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'
                  }`}>
                    <img
                      src={getImageUrl(item.product.images[0]?.url)}
                      alt={item.product.images[0]?.alt || item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className={`flex-1 ${viewMode === 'list' ? 'ml-4' : 'mt-4'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-black line-clamp-2">{item.product.name}</h3>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        disabled={removingItem === item._id}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        title="Remove from wishlist"
                      >
                        {removingItem === item._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {item.product.rating.average.toFixed(1)} ({item.product.rating.count})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-black">
                        ${item.product.price.toFixed(2)}
                      </span>
                      {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <p className="text-sm text-gray-600 mb-3">{item.product.category}</p>

                    {/* Size and Color Selection */}
                    <div className="space-y-2 mb-4">
                      {/* Size Selection */}
                      {item.product.sizes && item.product.sizes.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Size:</label>
                          <select className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-black focus:border-black">
                            {item.product.sizes.map((size) => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Color Selection */}
                      {item.product.colors && item.product.colors.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Color:</label>
                          <select className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-black focus:border-black">
                            {item.product.colors.map((color) => (
                              <option key={color.name} value={color.name}>{color.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(
                          item.product._id,
                          item.product.sizes?.[0] || 'M',
                          item.product.colors?.[0]?.name || 'Default'
                        )}
                        className="flex-1 bg-black text-white py-2 px-4 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <Link
                        href={`/products/${item.product._id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Added Date */}
                    <p className="text-xs text-gray-500 mt-3">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}

export default WishlistClient
