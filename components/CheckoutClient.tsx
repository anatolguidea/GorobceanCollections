'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, CreditCard, Truck, MapPin, Phone, Mail, Check, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useNotification } from '../contexts/NotificationContext'
import { api } from '../utils/api'

interface CheckoutForm {
  // Shipping Information
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Payment Information
  cardNumber: string
  cardName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  
  // Billing
  sameAsShipping: boolean
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
  billingCountry: string
}

const CheckoutClient = () => {
  const searchParams = useSearchParams()
  const { showNotification } = useNotification()
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'USA'
  })

  // Saved profile/address
  const [profileLoading, setProfileLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Array<{ type?: string; address: string; city: string; state: string; zipCode: string; country: string; isDefault?: boolean }>>([])
  const [selectedSavedIndex, setSelectedSavedIndex] = useState<number | null>(null)

  // Check for success parameter
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsSuccess(true)
    }
  }, [searchParams])

  // Load user profile to prefill name/email and saved addresses
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true)
        const res: any = await api.auth.getProfile()
        // Backend returns { success, data: user }
        const user = (res && (res.data?.data ?? res.data)) || null
        if (user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            email: user.email || prev.email,
          }))
          const addresses = Array.isArray(user.addresses) ? user.addresses : []
          setSavedAddresses(addresses)
          if (addresses.length > 0) {
            const defIdx = addresses.findIndex((a: any) => a.isDefault)
            const pickedIdx = defIdx >= 0 ? defIdx : 0
            setSelectedSavedIndex(pickedIdx)
            const addr = addresses[pickedIdx]
            if (addr?.address) {
              setFormData(prev => ({
                ...prev,
                address: addr.address,
                city: addr.city || '',
                state: addr.state || '',
                zipCode: addr.zipCode || '',
                country: addr.country || prev.country,
                sameAsShipping: true,
                billingAddress: addr.address,
                billingCity: addr.city || '',
                billingState: addr.state || '',
                billingZipCode: addr.zipCode || '',
                billingCountry: addr.country || prev.country,
              }))
            }
          }
        }
      } catch (e) {
        // Silent fail – checkout works without profile
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      quantity: 2,
      size: "M",
      color: "White"
    },
    {
      id: 2,
      name: "Slim Fit Jeans",
      price: 79.99,
      quantity: 1,
      size: "32",
      color: "Blue"
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 10.00
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const updateForm = (field: keyof CheckoutForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-fill billing address if same as shipping
    if (field === 'sameAsShipping' && value === true) {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingState: prev.state,
        billingZipCode: prev.zipCode,
        billingCountry: prev.country
      }))
    }
  }

  const nextStep = () => {
    if (currentStep === 'shipping') {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        showNotification({
          type: 'error',
          title: 'Missing Information',
          message: 'Please fill in all required shipping fields',
          duration: 4000
        })
        return
      }
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
        showNotification({
          type: 'error',
          title: 'Missing Information',
          message: 'Please fill in all required payment fields',
          duration: 4000
        })
        return
      }
      setCurrentStep('review')
    }
  }

  const prevStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping')
    } else if (currentStep === 'review') {
      setCurrentStep('payment')
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
      for (const field of requiredFields) {
        if (!formData[field as keyof CheckoutForm]) {
          showNotification({
            type: 'error',
            title: 'Missing Information',
            message: `Please fill in ${field}`,
            duration: 4000
          })
          return
        }
      }

      // Create order data
      const orderData = {
        customerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        items: cartItems.map(item => ({
          product: item.id, // This should be the actual product ID
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        paymentMethod: 'Credit Card', // or formData.paymentMethod
        status: 'pending'
      }

      // Submit order to API using the api utility
      const response = await api.orders.create(orderData)
      console.log('Order created successfully:', response)

      showNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: 'You will receive a confirmation email shortly.',
        duration: 5000
      })
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/checkout?success=true'
      }, 2000)
    } catch (error) {
      console.error('Order submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      showNotification({
        type: 'error',
        title: 'Order Failed',
        message: errorMessage,
        duration: 4000
      })
    }
  }

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check }
  ]

  // Success page
  if (isSuccess) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-8">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Order Placed Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your purchase. We've received your order and will process it shortly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                  <span className="text-gray-700">You'll receive an order confirmation email shortly</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                  <span className="text-gray-700">We'll prepare your items for shipping</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                  <span className="text-gray-700">You'll receive tracking information once shipped</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                View My Orders
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl lg:text-4xl font-light text-black tracking-[0.1em]">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-black bg-black text-white' :
                    isCompleted ? 'border-black bg-black text-white' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-black' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-black' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-8">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-medium text-black mb-6 tracking-wide flex items-center gap-3">
                    <Truck className="w-6 h-6" />
                    Shipping Information
                  </h2>
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 border border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-700">Use a saved address</span>
                        {profileLoading && <span className="text-xs text-gray-400">Loading…</span>}
                      </div>
                      <div className="space-y-2">
                        {savedAddresses.map((addr, idx) => (
                          <label key={idx} className="flex items-start gap-3 text-sm text-gray-800">
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedSavedIndex === idx}
                              onChange={() => setSelectedSavedIndex(idx)}
                              className="mt-1"
                            />
                            <span>
                              {addr.address}
                              <br />
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode} • {addr.country}
                              {addr.isDefault && <span className="ml-2 text-xs text-white bg-black px-2 py-0.5">Default</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedSavedIndex == null) return
                            const addr = savedAddresses[selectedSavedIndex]
                            if (!addr) return
                            setFormData(prev => ({
                              ...prev,
                              address: addr.address,
                              city: addr.city || '',
                              state: addr.state || '',
                              zipCode: addr.zipCode || '',
                              country: addr.country || prev.country,
                              sameAsShipping: true,
                              billingAddress: addr.address,
                              billingCity: addr.city || '',
                              billingState: addr.state || '',
                              billingZipCode: addr.zipCode || '',
                              billingCountry: addr.country || prev.country,
                            }))
                          }}
                          className="px-4 py-2 border border-gray-300 hover:bg-white bg-white text-gray-800"
                        >
                          Use Selected Address
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">State *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateForm('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => updateForm('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      >
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-medium text-black mb-6 tracking-wide flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    Payment Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => updateForm('cardNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => updateForm('cardName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Month *</label>
                        <select
                          value={formData.expiryMonth}
                          onChange={(e) => updateForm('expiryMonth', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          required
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Year *</label>
                        <select
                          value={formData.expiryYear}
                          onChange={(e) => updateForm('expiryYear', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          required
                        >
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year.toString().slice(-2)}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">CVV *</label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => updateForm('cvv', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onChange={(e) => updateForm('sameAsShipping', e.target.checked)}
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                        />
                        <label htmlFor="sameAsShipping" className="text-sm font-medium text-black">
                          Billing address same as shipping
                        </label>
                      </div>

                      {!formData.sameAsShipping && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-black mb-2">Billing Address</label>
                            <input
                              type="text"
                              value={formData.billingAddress}
                              onChange={(e) => updateForm('billingAddress', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Billing City</label>
                            <input
                              type="text"
                              value={formData.billingCity}
                              onChange={(e) => updateForm('billingCity', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Billing State</label>
                            <input
                              type="text"
                              value={formData.billingState}
                              onChange={(e) => updateForm('billingState', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Billing ZIP</label>
                            <input
                              type="text"
                              value={formData.billingZipCode}
                              onChange={(e) => updateForm('billingZipCode', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-medium text-black mb-6 tracking-wide flex items-center gap-3">
                    <Check className="w-6 h-6" />
                    Review Order
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6">
                      <h3 className="font-medium text-black mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-black">{item.name}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({item.size}, {item.color}) x {item.quantity}
                              </span>
                            </div>
                            <span className="font-medium text-black">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h3 className="font-medium text-black mb-4">Shipping Information</h3>
                      <div className="bg-gray-50 p-4">
                        <p className="text-black">{formData.firstName} {formData.lastName}</p>
                        <p className="text-gray-600">{formData.address}</p>
                        <p className="text-gray-600">{formData.city}, {formData.state} {formData.zipCode}</p>
                        <p className="text-gray-600">{formData.country}</p>
                        <p className="text-gray-600">{formData.email}</p>
                        <p className="text-gray-600">{formData.phone}</p>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="font-medium text-black mb-4">Payment Information</h3>
                      <div className="bg-gray-50 p-4">
                        <p className="text-black">Card ending in {formData.cardNumber.slice(-4)}</p>
                        <p className="text-gray-600">{formData.cardName}</p>
                        <p className="text-gray-600">Expires {formData.expiryMonth}/{formData.expiryYear}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep !== 'shipping' && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep === 'review' ? (
                  <button
                    onClick={handleSubmit}
                    className="ml-auto px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Place Order
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-medium text-black mb-6 tracking-wide">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-black">Total</span>
                    <span className="text-xl font-bold text-black">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <p className="text-xs">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}

export default CheckoutClient
