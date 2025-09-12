'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '../utils/api'
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
    phone?: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault?: boolean
  }>
}

interface OrderItem {
  product: { name: string }
  quantity: number
  price?: number
}

interface Order {
  _id: string
  createdAt: string
  status: string
  total?: number
  items?: OrderItem[]
}

const AccountClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile')
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
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Editable profile fields
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Address form
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })
  const [savingAddress, setSavingAddress] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkAuthStatus(token)
    }
  }, [])

  const checkAuthStatus = async (token: string) => {
    try {
      console.log('AccountClient: Checking auth status with token:', token)
      const response = await api.auth.getProfile()
      console.log('AccountClient: Profile response:', response)
      
      if (response.success && response.data && response.data.success && response.data.data) {
        setUser(response.data.data)
        setIsLoggedIn(true)
        setEditFirstName(response.data.data.firstName || '')
        setEditLastName(response.data.data.lastName || '')
        console.log('AccountClient: User authenticated successfully:', response.data.data)
      } else {
        console.log('AccountClient: Invalid response, removing token')
        // Token is invalid, remove it
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('AccountClient: Error checking auth status:', error)
      localStorage.removeItem('token')
    }
  }

  // Fetch orders when logged in or switching to orders tab
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn) return
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const response: any = await api.orders.getMine()
        if (response?.success && Array.isArray(response?.data?.data)) {
          setOrders(response.data.data)
        } else if (Array.isArray(response)) {
          setOrders(response as unknown as Order[])
        } else {
          setOrders([])
        }
      } catch (err: any) {
        setOrdersError(err?.message || 'Failed to load orders')
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, isLoggedIn])

  const saveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    setError(null)
    setSuccess(null)
    try {
      const response: any = await api.auth.updateProfile({ firstName: editFirstName, lastName: editLastName })
      if (response?.success) {
        const updated = { ...user, firstName: editFirstName, lastName: editLastName }
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
        setSuccess('Profile updated successfully')
      } else {
        setError(response?.message || 'Failed to update profile')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const addAddress = async () => {
    if (!user) return
    // Basic validation
    if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.zipCode || !newAddress.country) {
      setError('Please fill address, city, state, ZIP code, and country')
      return
    }
    setSavingAddress(true)
    setError(null)
    setSuccess(null)
    try {
      const updatedAddresses = [...(user.addresses || []), newAddress]
      const response: any = await api.auth.updateProfile({ addresses: updatedAddresses })
      if (response?.success) {
        const updated = { ...user, addresses: updatedAddresses }
        setUser(updated)
        setNewAddress({ type: 'home', phone: '', address: '', city: '', state: '', zipCode: '', country: '' })
        setSuccess('Address added')
      } else {
        setError(response?.message || 'Failed to add address')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add address')
    } finally {
      setSavingAddress(false)
    }
  }

  const removeAddress = async (index: number) => {
    if (!user || !user.addresses) return
    setSavingAddress(true)
    setError(null)
    setSuccess(null)
    try {
      const updatedAddresses = user.addresses.filter((_, i) => i !== index)
      const response: any = await api.auth.updateProfile({ addresses: updatedAddresses })
      if (response?.success) {
        const updated = { ...user, addresses: updatedAddresses }
        setUser(updated)
        setSuccess('Address removed')
      } else {
        setError(response?.message || 'Failed to remove address')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove address')
    } finally {
      setSavingAddress(false)
    }
  }

  const setDefaultAddress = async (index: number) => {
    if (!user || !user.addresses) return
    setSavingAddress(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = user.addresses.map((a, i) => ({ ...a, isDefault: i === index }))
      const response: any = await api.auth.updateProfile({ addresses: updated })
      if (response?.success) {
        const updatedUser = { ...user, addresses: updated }
        setUser(updatedUser)
        setSuccess('Default address set')
      } else {
        setError(response?.message || 'Failed to set default address')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to set default address')
    } finally {
      setSavingAddress(false)
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
        const response = await api.auth.login({
          email: formData.email,
          password: formData.password
        })

        if (response.success && response.data && response.data.success && response.data.data) {
          const { token, user } = response.data.data
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Dispatch custom events to update header
          window.dispatchEvent(new Event('storage'))
          window.dispatchEvent(new Event('authStateChanged'))
          
          setSuccess('Login successful!')
          setTimeout(() => {
            router.push(returnTo)
          }, 1000)
        } else {
          setError(response.message || 'Login failed')
        }
      } else {
        // Handle registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const response = await api.auth.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.password
        })

        if (response.success) {
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
          setError(response.message || 'Registration failed')
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
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
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
                      <div className="md:col-span-2">
                        <button
                          onClick={saveProfile}
                          disabled={savingProfile}
                          className="mt-2 px-5 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
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
                    {ordersLoading ? (
                      <div className="text-center py-12">
                        <div className="mx-auto h-6 w-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-12 text-red-600">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-light">No orders yet</p>
                        <p className="text-sm text-gray-400 mt-2">Start shopping to see your orders here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="border border-gray-200 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="text-sm text-gray-600">Order #{order._id.slice(-6)}</div>
                              <div className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-800">Status: <span className="font-medium">{order.status}</span></div>
                              <div className="text-sm text-gray-800">Total: <span className="font-medium">{order.total ? `€${order.total.toFixed(2)}` : '-'}</span></div>
                            </div>
                            {Array.isArray(order.items) && order.items.length > 0 && (
                              <ul className="mt-3 text-sm text-gray-700 list-disc list-inside">
                                {order.items.slice(0, 4).map((it, idx) => (
                                  <li key={idx}>{it.product?.name || 'Item'} x{it.quantity}</li>
                                ))}
                                {order.items.length > 4 && (
                                  <li className="text-gray-500">and {order.items.length - 4} more…</li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(user.addresses || []).map((addr, index) => (
                          <div key={index} className="border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm uppercase tracking-wide text-gray-500">{addr.type || 'home'}</span>
                              {addr.isDefault ? (
                                <span className="text-xs bg-black text-white px-2 py-1">Default</span>
                              ) : (
                                <button onClick={() => setDefaultAddress(index)} disabled={savingAddress} className="text-xs underline">Set default</button>
                              )}
                            </div>
                            <div className="text-sm text-gray-800 whitespace-pre-line">
                              {addr.address}\n{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode}\n{addr.country}{addr.phone ? `\n${addr.phone}` : ''}
                            </div>
                            <div className="mt-3 flex gap-3">
                              <button onClick={() => removeAddress(index)} disabled={savingAddress} className="text-sm text-red-600">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border border-gray-200 p-4">
                        <h3 className="font-medium text-black mb-3">Add New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="Street address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
                          />
                          <input
                            type="text"
                            placeholder="State/Province"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
                          />
                          <input
                            type="text"
                            placeholder="ZIP / Postal Code"
                            value={newAddress.zipCode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            value={newAddress.country}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black md:col-span-2"
                          />
                        </div>
                        <button
                          onClick={addAddress}
                          disabled={savingAddress}
                          className="mt-4 px-5 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {savingAddress ? 'Saving...' : 'Add Address'}
                        </button>
                      </div>
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
