'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Settings, Heart, Package, MapPin } from 'lucide-react'

interface UserForm {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  addresses?: Array<{
    type: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }>
}

const AccountClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<UserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })

  const [user, setUser] = useState<User | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkAuthStatus(token)
    }
  }, [])

  const checkAuthStatus = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
          setIsLoggedIn(true)
        }
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('token')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isLogin) {
        // Handle login
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          
          // Dispatch custom events to update header
          window.dispatchEvent(new Event('storage'))
          window.dispatchEvent(new Event('authStateChanged'))
          
          setSuccess('Login successful!')
          setTimeout(() => {
            router.push(returnTo)
          }, 1000)
        } else {
          setError(data.message || 'Login failed')
        }
      } else {
        // Handle registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
          }),
        })

        const data = await response.json()

        if (data.success) {
          setSuccess('Registration successful! Please log in.')
          setIsLogin(true)
          setFormData({
            email: formData.email,
            password: '',
            firstName: '',
            lastName: '',
            confirmPassword: ''
          })
        } else {
          setError(data.message || 'Registration failed')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    
    // Dispatch custom events to update header
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('authStateChanged'))
    
    router.push('/')
  }

  const updateForm = (field: keyof UserForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoggedIn && user) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-light text-black tracking-[0.1em] mb-6">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 font-light tracking-wide">
              Manage your account, orders, and preferences
            </p>
          </motion.div>

          {/* Account Navigation */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'orders', label: 'Orders', icon: Package },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'addresses', label: 'Addresses', icon: MapPin }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-light tracking-wide"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white border border-gray-200 p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-medium text-black mb-6 tracking-wide">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">First Name</label>
                        <input
                          type="text"
                          value={user.firstName}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                        <input
                          type="text"
                          value={user.lastName}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-black mb-2">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          readOnly
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-medium text-black mb-6 tracking-wide">Order History</h2>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-light">No orders yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start shopping to see your orders here</p>
                    </div>
                  </motion.div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-medium text-black mb-6 tracking-wide">My Wishlist</h2>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-light">Your wishlist is empty</p>
                      <p className="text-sm text-gray-400 mt-2">Start adding items to your wishlist</p>
                    </div>
                  </motion.div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-medium text-black mb-6 tracking-wide">Saved Addresses</h2>
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-light">No addresses saved</p>
                      <p className="text-sm text-gray-400 mt-2">Add addresses for faster checkout</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-gray-200 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-black mb-2 tracking-[0.1em]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 font-light tracking-wide">
              {isLogin ? 'Sign in to your account to continue' : 'Join us and start your fashion journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-black mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-black mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-black transition-colors font-light tracking-wide"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default AccountClient
