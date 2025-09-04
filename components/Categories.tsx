'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch categories from API
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

  const nextSlide = () => {
    if (!Array.isArray(categories) || categories.length === 0) return
    setCurrentIndex((prevIndex) => 
      prevIndex === categories.length - 4 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    if (!Array.isArray(categories) || categories.length === 0) return
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? categories.length - 4 : prevIndex - 1
    )
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
          <div className="flex gap-6 overflow-x-auto justify-center">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse flex-shrink-0 w-56">
                <div className="bg-gray-200 h-[300px] mb-4"></div>
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
              COLLECTIONS
            </h2>
            <p className="text-lg text-red-600">Error loading categories: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-light text-black tracking-[0.1em]">
            COLLECTIONS
          </h2>
        </motion.div>

        {/* Categories Navigation Container */}
        <div className="relative">
          {/* Left Arrow - only show if we have categories */}
          {Array.isArray(categories) && categories.length > 4 && (
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Right Arrow - only show if we have categories */}
          {Array.isArray(categories) && categories.length > 4 && (
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
              aria-label="Next categories"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Categories Horizontal Gallery */}
          <div className="flex gap-6 overflow-hidden justify-center px-12">
            {!Array.isArray(categories) || categories.length === 0 ? (
              <div className="w-full text-center py-12">
                <p className="text-lg text-gray-600">No categories available at the moment.</p>
              </div>
            ) : (
              categories.slice(currentIndex, currentIndex + 4).map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex-shrink-0 w-56"
              >
                <Link href={`/shop?category=${encodeURIComponent(category.name)}`} className="block">
                  <div className="relative bg-white overflow-hidden">
                    {/* Category Image */}
                    <div className="relative h-[300px] overflow-hidden bg-gray-100">
                      <img
                        src={category.image?.url || '/images/products/fashion.webp'}
                        alt={category.image?.alt || category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          console.error('Category image failed to load:', e.currentTarget.src)
                          e.currentTarget.src = '/images/products/fashion.webp'
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Category Info - Name below */}
                    <div className="mt-3 text-center">
                      <h3 className="text-sm font-light text-black tracking-[0.1em]">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Categories
