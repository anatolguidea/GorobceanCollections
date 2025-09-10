'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getImageUrl } from '@/utils/imageUtils'
import { Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '../utils/api'

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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 16
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Available sizes (standard clothing sizes + number sizes)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46']

  // Debounced price range for smooth filtering
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({ min: '', max: '' })

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchProducts()
  }, [selectedCategory, selectedSizes, debouncedPriceRange.min, debouncedPriceRange.max, sortBy, sortOrder, searchParams])

  // Fetch products when page changes
  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  // Debounce price range changes - removed automatic reloading
  // Price range will only be applied when user clicks "Apply Price Filter"

  // Handle URL parameters for category filtering and search
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    
    if (searchParam) {
      // You could add a search input state here if needed
      console.log('Search query from URL:', searchParam)
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
      // Only set main loading on initial load, not on filter changes
      if (products.length === 0) {
        setLoading(true)
      }
      
      const searchQuery = searchParams.get('search')
      
      // Only include parameters that have values
      const apiParams: Record<string, any> = {
        sortBy,
        sortOrder,
        limit: productsPerPage,
        page: currentPage
      }
      
      if (selectedCategory) apiParams.category = selectedCategory
      if (selectedSizes.length > 0) {
        apiParams.sizes = selectedSizes.join(',')
      }
      if (debouncedPriceRange.min) apiParams.minPrice = debouncedPriceRange.min
      if (debouncedPriceRange.max) apiParams.maxPrice = debouncedPriceRange.max
      if (searchQuery) apiParams.search = searchQuery
      
      const response = await api.products.getAll(apiParams)
      
      if (response.success && response.data && response.data.success && response.data.data && Array.isArray(response.data.data.products)) {
        setProducts(response.data.data.products)
        
        // Update pagination info if available
        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.totalPages || 1)
          setTotalProducts(response.data.data.pagination.totalProducts || 0)
        }
      } else {
        setProducts([])
        setError('Failed to fetch products')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setFilterLoading(false)
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll()
      if (response.success && response.data && response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data)
      } else {
        console.error('Invalid categories response:', response)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }


  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
      return newSizes
    })
  }


  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [field]: value }))
  }

  const applyPriceFilter = () => {
    setDebouncedPriceRange(priceRange)
  }

  const handleSortChange = (newSortBy: string) => {
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
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSizes([])
    setPriceRange({ min: '', max: '' })
    setDebouncedPriceRange({ min: '', max: '' })
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-10 rounded w-1/4 mx-auto mb-4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(16)].map((_, index) => (
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
              {searchParams.get('search') && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Search: "{searchParams.get('search')}"
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
                  {Array.isArray(categories) && categories.map((category) => (
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
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      } ${filterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
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
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      disabled={filterLoading}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Apply Price Filter Button */}
                  <button
                    onClick={applyPriceFilter}
                    disabled={filterLoading || (!priceRange.min && !priceRange.max)}
                    className="w-full px-4 py-2 bg-black text-white text-sm rounded transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    Apply Price Filter
                  </button>
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
          <div className="flex-1 relative">
            {/* Filter Loading Overlay */}
            {filterLoading && products.length > 0 && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Updating results...</p>
                </div>
              </div>
            )}
            
            {filterLoading && products.length === 0 ? (
              /* Loading State for Products */
              <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin mb-4" />
                <h2 className="text-xl font-light text-gray-600 mb-2">Loading products...</h2>
                <p className="text-sm text-gray-500">Please wait while we fetch your products</p>
              </div>
            ) : Array.isArray(products) && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  // Get the best image: primary first, then first image
                  const bestImage = product.images.find(img => img.isPrimary) || product.images[0]
                  
                  return (
                    <div key={product._id} className="group px-3">
                      <Link href={`/products/${product._id}`} className="block">
                        <div className="relative bg-white overflow-hidden">
                          {/* Product Image */}
                          <div className="relative h-80 overflow-hidden bg-gray-100">
                            <img
                              src={getImageUrl(bestImage?.url)}
                              alt={bestImage?.alt || product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                console.error('Shop product image failed to load:', e.currentTarget.src)
                                console.error('Product:', product.name, 'Image URL:', bestImage?.url)
                                e.currentTarget.src = '/images/placeholder-product.svg'
                              }}
                              onLoad={(e) => {
                                console.log('Shop product image loaded successfully:', e.currentTarget.src)
                              }}
                              crossOrigin="anonymous"
                            />
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
                <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">📦</span>
                </div>
                <h2 className="text-2xl font-light text-black tracking-[0.1em] mb-4">
                  No Products Found
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedCategory || selectedSizes.length > 0 || priceRange.min || priceRange.max
                    ? 'Try adjusting your filters to see more products.'
                    : 'We\'re currently setting up our product catalog. Check back soon!'
                  }
                </p>
                {(selectedCategory || selectedSizes.length > 0 || priceRange.min || priceRange.max) && (
                  <button 
                    onClick={clearFilters}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
            
            {/* Pagination Controls */}
            {Array.isArray(products) && products.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || filterLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={filterLoading}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || filterLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Products count info */}
            {Array.isArray(products) && products.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
