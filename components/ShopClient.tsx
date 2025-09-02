'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getImageUrl } from '@/utils/imageUtils'
import { Package, Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: Array<{
    url: string
    alt: string
    isPrimary?: boolean
  }>
  category: string
  colors: Array<{
    _id: string
    name: string
    hex: string
    inStock: boolean
  }>
  sizes: string[]
  isFeatured: boolean
  isNewArrival: boolean
  isSale: boolean
  createdAt: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

export default function ShopClient() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounced price range for smooth filtering
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({ min: '', max: '' })

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedSizes, selectedColors, debouncedPriceRange.min, debouncedPriceRange.max, sortBy, sortOrder])

  // Debounce price range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [priceRange])

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Fetch categories only once on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setFilterLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      
      // Add filters
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedSizes.length > 0) params.append('sizes', selectedSizes.join(','))
      if (selectedColors.length > 0) params.append('colors', selectedColors.join(','))
      if (debouncedPriceRange.min) params.append('minPrice', debouncedPriceRange.min)
      if (debouncedPriceRange.max) params.append('maxPrice', debouncedPriceRange.max)
      if (sortBy) params.append('sortBy', sortBy)
      if (sortOrder) params.append('sortOrder', sortOrder)
      
      // Set limit to show more products
      params.append('limit', '50')
      
      const url = `http://localhost:5001/api/products?${params.toString()}`
      console.log('🔍 Fetching products with filters:', {
        selectedCategory,
        selectedSizes,
        selectedColors,
        priceRange: debouncedPriceRange,
        sortBy,
        sortOrder
      })
      console.log('🔍 API URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🔍 API response:', data)
      
      if (data.success) {
        setProducts(data.data.products || [])
        console.log('✅ Products loaded:', data.data.products?.length || 0)
      } else {
        setError(data.message || 'Failed to fetch products')
        console.error('❌ API error:', data.message)
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setFilterLoading(false)
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName)
  }, [])

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }, [])

  const handleColorChange = useCallback((color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }, [])

  const handlePriceRangeChange = useCallback((field: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSortChange = useCallback((newSortBy: string) => {
    // Map frontend sort values to backend values
    let backendSortBy = 'createdAt'
    let backendSortOrder = 'desc'
    
    switch (newSortBy) {
      case 'newest':
        backendSortBy = 'createdAt'
        backendSortOrder = 'desc'
        break
      case 'oldest':
        backendSortBy = 'createdAt'
        backendSortOrder = 'asc'
        break
      case 'price-asc':
        backendSortBy = 'price'
        backendSortOrder = 'asc'
        break
      case 'price-desc':
        backendSortBy = 'price'
        backendSortOrder = 'desc'
        break
      case 'name-asc':
        backendSortBy = 'name'
        backendSortOrder = 'asc'
        break
      case 'name-desc':
        backendSortBy = 'name'
        backendSortOrder = 'desc'
        break
      default:
        backendSortBy = 'createdAt'
        backendSortOrder = 'desc'
    }
    
    setSortBy(backendSortBy)
    setSortOrder(backendSortOrder)
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategory('')
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange({ min: '', max: '' })
    setSortBy('createdAt')
    setSortOrder('desc')
  }, [])

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46']
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray']

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-10 rounded w-1/4 mx-auto mb-4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse px-3">
                <div className="bg-gray-200 h-64 mb-4"></div>
                <div className="bg-gray-200 h-5 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-light text-black tracking-[0.1em] mb-4">
              All Products
            </h2>
            <p className="text-lg text-red-600">{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Sort By on the right */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-light text-black tracking-[0.1em] mb-4">
              ALL PRODUCTS
            </h1>
            <div className="flex items-center justify-center gap-3">
              {filterLoading && (
                <span className="flex items-center gap-2 text-lg text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating results...
                </span>
              )}
              {selectedCategory && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Category: {selectedCategory}
                </span>
              )}
            </div>
          </div>
          
          {/* Sort By Dropdown - Right Top */}
          <div className="flex-shrink-0">
            <select
              value={`${sortBy === 'createdAt' && sortOrder === 'desc' ? 'newest' : 
                      sortBy === 'createdAt' && sortOrder === 'asc' ? 'oldest' :
                      sortBy === 'price' && sortOrder === 'asc' ? 'price-asc' :
                      sortBy === 'price' && sortOrder === 'desc' ? 'price-desc' :
                      sortBy === 'name' && sortOrder === 'asc' ? 'name-asc' :
                      sortBy === 'name' && sortOrder === 'desc' ? 'name-desc' : 'newest'}`}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={filterLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:block w-64 flex-shrink-0 ${isSidebarOpen ? 'fixed inset-0 z-50 lg:relative' : 'hidden'}`}>
            {isSidebarOpen && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
            )}
            
            <div className={`bg-white p-6 rounded-lg border border-gray-200 lg:border-0 lg:p-0 ${isSidebarOpen ? 'fixed left-0 top-0 h-full w-64 overflow-y-auto z-50' : ''}`}>
              {/* Mobile Close Button */}
              <div className="lg:hidden flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-light text-black tracking-[0.1em] mb-3 uppercase">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    disabled={filterLoading}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 ${
                      selectedCategory === '' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                    } ${filterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryChange(category.name)}
                      disabled={filterLoading}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 ${
                        selectedCategory === category.name ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                      } ${filterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="text-sm font-light text-black tracking-[0.1em] mb-3 uppercase">Sizes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      disabled={filterLoading}
                      className={`px-3 py-2 text-xs rounded border transition-all duration-200 ${
                        selectedSizes.includes(size) 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      } ${filterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h3 className="text-sm font-light text-black tracking-[0.1em] mb-3 uppercase">Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      disabled={filterLoading}
                      className={`px-3 py-2 text-xs rounded border transition-all duration-200 ${
                        selectedColors.includes(color) 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      } ${filterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-light text-black tracking-[0.1em] mb-3 uppercase">Price Range</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      disabled={filterLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filterLoading && priceRange.min && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      disabled={filterLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {filterLoading && priceRange.max && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                disabled={filterLoading}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filterLoading ? (
              /* Loading State for Products */
              <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin mb-4" />
                <h2 className="text-xl font-light text-gray-600 mb-2">Updating results...</h2>
                <p className="text-sm text-gray-500">Please wait while we fetch your filtered products</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
                  
                  return (
                    <div key={product._id} className="group px-3">
                      <Link href={`/products/${product._id}`} className="block">
                        <div className="relative bg-white overflow-hidden">
                          {/* Product Image */}
                          <div className="relative h-64 overflow-hidden bg-gray-100">
                            {primaryImage ? (
                              <img
                                src={getImageUrl(primaryImage.url)}
                                alt={primaryImage.alt || product.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const fallback = target.parentElement?.querySelector('.fallback-image')
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex'
                                  }
                                }}
                              />
                            ) : null}
                            <div className="fallback-image absolute inset-0 flex items-center justify-center bg-gray-200" style={{ display: primaryImage ? 'none' : 'flex' }}>
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* Product Info - Name and Price below */}
                          <div className="mt-3 text-center">
                            <h3 className="text-sm font-light text-black mb-1 tracking-[0.1em]">
                              {product.name}
                            </h3>
                            
                            {/* Price */}
                            <div className="text-sm font-light text-black tracking-[0.1em]">
                              €{product.price.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* No Products Found Message - Keep it in the products area */
              <div className="text-center py-16">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-light text-black tracking-[0.1em] mb-4">
                  No Products Found
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min || priceRange.max
                    ? 'Try adjusting your filters to see more products.'
                    : 'We\'re currently setting up our product catalog. Check back soon!'
                  }
                </p>
                {(selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min || priceRange.max) && (
                  <button 
                    onClick={clearFilters}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
