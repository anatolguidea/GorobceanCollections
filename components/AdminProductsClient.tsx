'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { getImageUrl } from '../utils/imageUtils'

interface Product {
  _id: string
  name: string
  price: number
  category: string
  isActive: boolean
  isFeatured: boolean
  isSale: boolean
  images: Array<{ url: string; alt: string }>
  createdAt: string
}

const AdminProductsClient = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.products.getAll({ limit: 100 })
      if (response.success && response.data && response.data.success && response.data.data && Array.isArray(response.data.data.products)) {
        setProducts(response.data.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await api.products.delete(productId)

      if (response.success) {
        setProducts(products.filter(p => p._id !== productId))
        setShowDeleteModal(false)
        setProductToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-black tracking-[0.1em]">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">{products.length}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                {products.filter(p => p.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Active Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                {products.filter(p => p.isFeatured).length}
              </p>
              <p className="text-sm text-gray-600">Featured Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                {products.filter(p => p.isSale).length}
              </p>
              <p className="text-sm text-gray-600">Sale Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-4">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getImageUrl(product.images[0].url)}
                            alt={product.images[0].alt || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">{product.name}</div>
                        <div className="text-sm text-gray-600">ID: {product._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-black">${product.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {product.isActive && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                      {product.isSale && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Sale
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product._id}`}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setProductToDelete(product._id)
                          setShowDeleteModal(true)
                        }}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <h2 className="text-xl font-medium text-black mb-4">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteProduct(productToDelete)}
                className="flex-1 bg-red-600 text-white py-2 font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-300 text-black py-2 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsClient
