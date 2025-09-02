'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, Heart, Globe, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { isAuthenticated, getToken } from '../utils/auth'

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
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])


  const navigation = [
    { name: 'NEW IN', href: '/shop' },
    { name: 'BESTSELLERS', href: '/products' },
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

    fetchCategories()
  }, [])



  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const token = getToken()
      setIsUserAuthenticated(authenticated)
      setUserToken(token)
      
      if (token) {
        fetchCartCount(token)
        fetchWishlistCount(token)
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
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      setIsAdmin(false)
    }
  }

  const fetchCartCount = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.items) {
          setCartCount(data.data.items.length)
        } else {
          setCartCount(0)
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('token')
        setCartCount(0)
      }
    } catch (error) {
      setCartCount(0)
    }
  }

  const fetchWishlistCount = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.items) {
          setWishlistCount(data.data.items.length)
        } else {
          setWishlistCount(0)
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('token')
        setWishlistCount(0)
      }
    } catch (error) {
      setWishlistCount(0)
    }
  }

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchCartCount(token)
        fetchWishlistCount(token)
        checkAdminRole(token)
      } else {
        setCartCount(0)
        setWishlistCount(0)
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

    const handleWishlistUpdate = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchWishlistCount(token)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
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
                      {categories.map((category) => (
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
              <button className="p-2 text-black hover:text-gray-500 transition-colors duration-300">
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button 
                onClick={() => {
                  if (isUserAuthenticated) {
                    window.location.href = "/wishlist"
                  } else {
                    window.location.href = "/login?redirect=/wishlist"
                  }
                }}
                className="p-2 text-black hover:text-gray-500 transition-colors duration-300 relative"
              >
                <Heart className="w-5 h-5" />
                {isClient && isUserAuthenticated && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-light">
                    {wishlistCount}
                  </span>
                )}
              </button>

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
                    {categories.map((category) => (
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
                
                {/* Mobile Wishlist Link */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    if (isUserAuthenticated) {
                      window.location.href = "/wishlist"
                    } else {
                      window.location.href = "/login?redirect=/wishlist"
                    }
                  }}
                  className="block w-full text-left px-4 py-3 text-black hover:text-gray-500 hover:bg-gray-50 transition-colors duration-300 font-light"
                >
                  Wishlist {isClient && isUserAuthenticated && wishlistCount > 0 && `(${wishlistCount})`}
                </button>
                
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
