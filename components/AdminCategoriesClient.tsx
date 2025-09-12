'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { api } from '../../utils/api'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image: {
    url: string
    alt: string
  }
  order: number
  isActive: boolean
  isFeatured: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

const AdminCategoriesClient = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await api.categories.delete(categoryId)
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat._id !== categoryId))
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 border border-gray-200 rounded-lg">
        <div>
          <h1 className="text-3xl font-light text-black tracking-[0.1em]">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage your product categories and collections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition-colors rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Category Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={category.image?.url || '/images/placeholder-product.svg'}
                alt={category.image?.alt || category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-product.svg'
                }}
              />
              {category.isFeatured && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-black">{category.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{category.productCount} products</span>
                <span>Order: {category.order}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-200 transition-colors rounded-md flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first category.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition-colors rounded-md flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesClient
