'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, Globe, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { isAuthenticated, getToken } from '../utils/auth'
import { api } from '../utils/api'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image: { url: string; alt: string }
  productCount: number
  isFeatured: boolean
}



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const navigation = [
    { name: 'NEW IN', href: '/shop' },
    { name: 'CONTACT US', href: '/contact' },
  ]

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch categories for catalog dropdown
  useEffect(() => {
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

    fetchCategories()
  }, [])

  // Debounced search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await api.products.getAll({
          search: searchQuery,
          limit: 8
        })
        
        if (response.success && response.data && response.data.success && response.data.data && Array.isArray(response.data.data.products)) {
          setSearchResults(response.data.data.products)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && !(event.target as Element).closest('.search-dropdown')) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen])

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const token = getToken()
      console.log('Header: Auth check - authenticated:', authenticated, 'token:', !!token)
      setIsUserAuthenticated(authenticated)
      setUserToken(token)
      
      if (token) {
        fetchCartCount(token)
        checkAdminRole(token)
      }
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

  const checkAdminRole = async (token: string) => {
    try {
      const data = await api.auth.getProfile()
      console.log('Admin role check response:', data)
      if (data.success && data.data && data.data.success && data.data.data && data.data.data.role === 'admin') {
        setIsAdmin(true)
        console.log('Admin role confirmed')
      } else {
        setIsAdmin(false)
        console.log('Not admin or invalid response')
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      setIsAdmin(false)
    }
  }

  const fetchCartCount = async (token: string) => {
    try {
      const data = await api.cart.get()
      if (data.success && data.data && data.data.items) {
        setCartCount(data.data.items.length)
      } else {
        setCartCount(0)
      }
    } catch (error) {
      // Token expired or invalid
      localStorage.removeItem('token')
      setCartCount(0)
    }
  }


  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchCartCount(token)
        checkAdminRole(token)
      } else {
        setCartCount(0)
        setIsAdmin(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Listen for custom events
  useEffect(() => {
    const handleCartUpdate = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchCartCount(token)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo - Moved to the left */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex flex-col items-start">
              <span className="text-3xl font-light text-black tracking-[0.2em]">GOROBCEAN</span>
              <span className="text-sm text-black tracking-[0.3em] font-light">COLLECTIONS</span>
            </Link>
          </div>
          
          {/* Center Navigation */}
          <nav className="hidden lg:flex space-x-20">
            {/* Catalog Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                onMouseEnter={() => setIsCatalogOpen(true)}
                onMouseLeave={() => setIsCatalogOpen(false)}
                className="flex items-center space-x-1 text-black hover:text-gray-500 transition-colors duration-300 font-light tracking-[0.1em] text-sm"
              >
                <span>CATALOG</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCatalogOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Catalog Dropdown Menu */}
              <AnimatePresence>
                {isCatalogOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setIsCatalogOpen(true)}
                    onMouseLeave={() => setIsCatalogOpen(false)}
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg py-4"
                  >
                    {/* View All Categories Link */}
                    <Link
                      href="/catalog"
                      className="block px-4 py-3 text-black hover:bg-gray-50 transition-colors duration-200 text-sm tracking-wide font-light border-b border-gray-100 mb-2"
                      onClick={() => setIsCatalogOpen(false)}
                    >
                      View All Categories
                    </Link>
                    
                    {/* Categories List */}
                    <div className="grid grid-cols-1 gap-1">
                      {Array.isArray(categories) && categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/shop?category=${encodeURIComponent(category.name)}`}
                          className="px-4 py-3 text-black hover:bg-gray-50 transition-colors duration-200 text-sm tracking-wide font-light"
                          onClick={() => setIsCatalogOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Other Navigation Items */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-black hover:text-gray-500 transition-colors duration-300 font-light tracking-[0.1em] text-sm"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-8">
              {/* Search */}
              <div className="relative search-dropdown">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-black hover:text-gray-500 transition-colors duration-300"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                {/* Search Dropdown */}
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50"
                    >
                      {/* Search Input */}
                      <div className="p-4 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          autoFocus
                        />
                      </div>
                      
                      {/* Search Results */}
                      <div className="max-h-96 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((product) => (
                              <Link
                                key={product._id}
                                href={`/products/${product._id}`}
                                className="block p-3 hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => {
                                  setIsSearchOpen(false)
                                  setSearchQuery('')
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={product.images[0].url}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">No Image</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      ${product.price}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {searchResults.length === 8 && (
                              <Link
                                href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                className="block p-3 text-center text-sm text-black hover:bg-gray-50 border-t border-gray-100"
                                onClick={() => {
                                  setIsSearchOpen(false)
                                  setSearchQuery('')
                                }}
                              >
                                View all results for "{searchQuery}"
                              </Link>
                            )}
                          </div>
                        ) : searchQuery.trim() ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No products found
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Start typing to search products
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Account */}
              <Link href="/account" className="p-2 text-black hover:text-gray-500 transition-colors duration-300">
                <User className="w-5 h-5" />
              </Link>

              {/* Admin Panel (only show if user is admin) */}
              {isClient && isUserAuthenticated && isAdmin && (
                <Link href="/admin" className="p-2 text-black hover:text-gray-500 transition-colors duration-300">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-light">A</span>
                  </div>
                </Link>
              )}

              {/* Shopping Cart */}
              <button 
                onClick={() => {
                  if (isUserAuthenticated) {
                    window.location.href = "/cart"
                  } else {
                    window.location.href = "/login?redirect=/cart"
                  }
                }}
                className="relative p-2 text-black hover:text-gray-500 transition-colors duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                {isClient && isUserAuthenticated && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-light">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Language/Region */}
              <button className="p-2 text-black hover:text-gray-500 transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-black hover:text-gray-500 transition-colors duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-100"
            >
              <div className="py-6 space-y-3">
                {/* Mobile Catalog */}
                <div className="px-4 py-3">
                  <Link
                    href="/catalog"
                    className="block text-black hover:text-gray-500 transition-colors duration-300 text-sm tracking-[0.1em] font-light mb-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CATALOG
                  </Link>
                  <div className="space-y-2 ml-4">
                    {Array.isArray(categories) && categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/shop?category=${encodeURIComponent(category.name)}`}
                        className="block text-black hover:text-gray-500 transition-colors duration-200 text-sm tracking-wide font-light"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Other Mobile Navigation Items */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-black hover:text-gray-500 hover:bg-gray-50 transition-colors duration-300 text-sm tracking-[0.1em] font-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                
                {/* Mobile Cart Link */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    if (isUserAuthenticated) {
                      window.location.href = "/cart"
                    } else {
                      window.location.href = "/login?redirect=/cart"
                    }
                  }}
                  className="block w-full text-left px-4 py-3 text-black hover:text-gray-500 hover:bg-gray-50 transition-colors duration-300 font-light"
                >
                  Cart {isClient && isUserAuthenticated && cartCount > 0 && `(${cartCount})`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
