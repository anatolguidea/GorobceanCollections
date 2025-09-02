'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getImageUrl } from '../utils/imageUtils'

interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>
  category: string
  rating: { average: number; count: number }
  isNewArrival?: boolean
  isSale?: boolean
  isFeatured?: boolean
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        setLoading(true)
        console.log('Fetching random products...')
        // Fetch random products using the new endpoint
        const response = await fetch('http://localhost:5001/api/products/random/random?limit=4')
        console.log('Random products response status:', response.status)
        
        if (!response.ok) {
          throw new Error('Failed to fetch random products')
        }
        
        const data = await response.json()
        console.log('Random products data:', data)
        
        if (data.success) {
          setProducts(data.data.products)
          console.log('Random products set:', data.data.products.length)
        } else {
          throw new Error(data.message || 'Failed to fetch random products')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching random products:', err)
      } finally {
        setLoading(false)
        console.log('Loading finished')
      }
    }

    fetchRandomProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-black tracking-[0.1em] mb-4">
              FEATURED PRODUCTS
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto justify-center">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse flex-shrink-0 w-56">
                <div className="bg-gray-200 h-[500px] mb-4"></div>
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
            FEATURED PRODUCTS
          </h2>
          <p className="text-lg text-red-600">Error loading random products: {error}</p>
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
          <h2 className="text-3xl font-light text-black tracking-[0.1em] mb-4">
            FEATURED PRODUCTS
          </h2>
        </motion.div>

        {/* Products Horizontal Gallery */}
        <div className="flex gap-6 overflow-x-auto pb-4 justify-center">
          {products.length === 0 ? (
            <div className="w-full text-center py-12">
              <p className="text-lg text-gray-600">No featured products available at the moment.</p>
            </div>
          ) : (
            products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group flex-shrink-0 w-56"
            >
              <Link 
                href={`/products/${product._id}`}
                className="block"
              >
                <div className="relative bg-white overflow-hidden">
                  {/* Product Image - Model wearing the clothing */}
                  <div className="relative h-[300px] overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(product.images[0]?.url)}
                      alt={product.images[0]?.alt || product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Featured product image failed to load:', e.currentTarget.src)
                        console.error('Product:', product.name, 'Image URL:', product.images[0]?.url)
                        e.currentTarget.src = '/images/products/fashion.webp'
                      }}
                      onLoad={(e) => {
                        console.log('Featured product image loaded successfully:', e.currentTarget.src)
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
            </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
