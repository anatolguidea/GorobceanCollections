'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

const CatalogClient = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await api.categories.getAll()
        if (response.success && response.data && response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data)
        } else {
          throw new Error('Invalid categories response')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching categories:', err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-12 rounded w-1/3 mx-auto mb-4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-80 mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">CATALOG</h1>
          <p className="text-red-600">Error loading categories: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl lg:text-6xl font-light text-white tracking-[0.1em] mb-6"
          >
            CATALOG
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto"
          >
            Discover our complete collection of premium fashion categories
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {Array.isArray(categories) && categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group"
              >
                <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
                  <div className="relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group-hover:shadow-lg">
                    {/* Category Image */}
                    <div className="relative h-96 overflow-hidden">
                      <img
                        src={category.image?.url || '/images/products/fashion.webp'}
                        alt={category.image?.alt || category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-medium text-black tracking-wide group-hover:text-gray-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                      
                      {category.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 font-light">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-light">
                          {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                        <span className="text-xs text-black tracking-[0.1em] font-light uppercase">
                          Explore
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-light text-black tracking-wide mb-6">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-8 font-light">
              Contact our team for personalized assistance
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-800 transition-colors duration-300"
            >
              Contact Us
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CatalogClient
