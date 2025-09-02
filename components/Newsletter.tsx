'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1500)
  }

  if (isSubscribed) {
    return (
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8"
          >
            <CheckCircle className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-black mb-4 tracking-wide">
              WELCOME TO BARBARA COLLECTION
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for subscribing to our newsletter. You'll be the first to know about 
              new arrivals, exclusive offers, and style tips.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="bg-black text-white px-8 py-3 font-medium tracking-wide hover:bg-gray-800 transition-colors duration-200"
            >
              SUBSCRIBE ANOTHER EMAIL
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-wide"
          >
            STAY IN THE LOOP
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto tracking-wide"
          >
            Subscribe to our newsletter and be the first to discover new collections, 
            exclusive offers, and insider style tips.
          </motion.p>

          {/* Newsletter Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-white focus:border-white text-black placeholder-gray-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 px-6 transition-colors duration-200 whitespace-nowrap tracking-wide"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    SUBSCRIBING...
                  </div>
                ) : (
                  'SUBSCRIBE'
                )}
              </button>
            </div>
          </motion.form>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-sm text-gray-400 mt-6"
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default Newsletter
