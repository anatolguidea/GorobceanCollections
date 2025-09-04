'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  Eye,
  Star,
  ArrowLeft,
  Lock,
  Shield,
  Truck,
  RotateCcw,
  X
} from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'
import Link from 'next/link'
import Notification from './Notification'
import { api } from '../utils/api'
import Image from 'next/image'

interface CartItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    images: Array<{ url: string; alt: string }>
  }
  size: string
  color: string
  quantity: number
}

interface Cart {
  _id: string
  user: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: {
    cost: number
    method: string
    estimatedDays: number
  }
  total: number
}

const CartClient = () => {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [notification, setNotification] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    isVisible: false
  })
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  })
  const [submittingOrder, setSubmittingOrder] = useState(false)

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    })
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }

  const handleOrderSubmit = async () => {
    if (!cart || !userToken) return

    // Validate cart has items
    if (!cart.items || cart.items.length === 0) {
      showNotification('Your cart is empty. Please add items before placing an order.', 'error')
      return
    }

    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    for (const field of requiredFields) {
      if (!customerForm[field as keyof typeof customerForm]) {
        showNotification(`Please fill in ${field}`, 'error')
        return
      }
    }

    setSubmittingOrder(true)

    try {
      const orderData = {
        customerDetails: {
          firstName: customerForm.firstName,
          lastName: customerForm.lastName,
          email: customerForm.email,
          phone: customerForm.phone,
          address: customerForm.address,
          city: customerForm.city,
          state: customerForm.state,
          zipCode: customerForm.zipCode,
          country: customerForm.country || 'USA'
        },
        items: (cart.items || []).map(item => ({
          product: item.product._id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping?.cost || 0,
        total: cart.total,
        paymentMethod: 'Cash on Delivery',
        status: 'pending'
      }

      console.log('Submitting order data:', orderData)
      const response = await api.orders.create(orderData)
      console.log('Order created successfully:', response)
      
      showNotification('Order placed successfully! You will receive a confirmation email shortly.', 'success')
      
      // Clear cart and redirect to confirmation
      setTimeout(() => {
        router.push('/checkout?success=true')
      }, 2000)
    } catch (error) {
      console.error('Order submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while placing your order. Please try again.'
      showNotification(errorMessage, 'error')
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Check authentication and fetch cart
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setUserToken(token)
      fetchCart(token)
    } else {
      setLoading(false)
      setError('Please log in to view your cart')
    }
  }, [])

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      const token = localStorage.getItem('token')
      if (token) {
        fetchCart(token)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Fetch recommended products
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      fetchRecommendedProducts()
    }
  }, [cart])

  const fetchCart = async (token: string) => {
    try {
      const response = await api.cart.get()
      console.log('Cart API response:', response)
      if (response.success && response.data && response.data.data) {
        setCart(response.data.data)
      } else {
        setError('Failed to fetch cart')
      }
    } catch (error) {
      console.error('Cart fetch error:', error)
      setError('An error occurred while fetching cart')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedProducts = async () => {
    setLoadingRecommendations(true)
    try {
      const data = await api.products.getAll({ limit: 4 })
      if (data.success && data.data && data.data.success && data.data.data && Array.isArray(data.data.data.products)) {
        setRecommendedProducts(data.data.data.products)
      }
    } catch (error) {
      console.error('Error fetching recommended products:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      await api.cart.updateItem(itemId, { quantity: newQuantity })
      
      // Update local cart state
      setCart(prev => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map(item => 
            item._id === itemId ? { ...item, quantity: newQuantity } : item
          )
        }
      })
      
      // Recalculate totals
      recalculateTotals()
      showNotification('Cart updated successfully')
    } catch (error) {
      showNotification('An error occurred while updating cart', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await api.cart.removeItem(itemId)
      
      setCart(prev => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.filter(item => item._id !== itemId)
        }
      })
      
      recalculateTotals()
      showNotification('Item removed from cart')
    } catch (error) {
      showNotification('An error occurred while removing item', 'error')
    }
  }

  const recalculateTotals = () => {
    if (!cart) return

    const subtotal = cart.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0
    const tax = subtotal * 0.08 // 8% tax
    const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
    const total = subtotal + tax + shipping

    setCart(prev => {
      if (!prev) return prev
      return {
        ...prev,
        subtotal,
        tax,
        shipping: { ...prev.shipping, cost: shipping },
        total
      }
    })
  }


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

  if (error) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-black mb-4">Unable to Load Cart</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-black mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
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
            Continue Shopping
          </Link>
          <h1 className="text-3xl lg:text-4xl font-light text-black tracking-[0.1em]">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cart.items?.length || 0} item{(cart.items?.length || 0) !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200">
              {(cart.items || []).map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-6 border-b border-gray-100 last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 mr-6 overflow-hidden">
                    <Image
                      src={getImageUrl(item.product.images[0]?.url)}
                      alt={item.product.images[0]?.alt || item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-black mb-2">{item.product.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/products/${item.product._id}`}
                        className="text-gray-400 hover:text-black transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mr-6">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={updating === item._id}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={updating === item._id}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price and Remove */}
                  <div className="text-right">
                    <div className="text-lg font-medium text-black mb-2">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-medium text-black mb-6 tracking-wide">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart.shipping.cost === 0 ? 'Free' : `$${cart.shipping.cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-black">Total</span>
                    <span className="text-xl font-bold text-black">${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCustomerForm(true)}
                className="w-full bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-black">Customer Information</h3>
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">First Name</label>
                    <input
                      type="text"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                    <input
                      type="text"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Address</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">City</label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">State</label>
                    <input
                      type="text"
                      value={customerForm.state}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">ZIP</label>
                    <input
                      type="text"
                      value={customerForm.zipCode}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCustomerForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOrderSubmit}
                    disabled={submittingOrder}
                    className="flex-1 bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submittingOrder ? 'Submitting...' : 'Submit Order'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-medium text-black mb-8 tracking-wide">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 group"
                >
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                      src={getImageUrl(product.images[0]?.url)}
                      alt={product.images[0]?.alt || product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-black mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-black">${product.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </main>
  )
}

export default CartClient
