'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Package, 
  Save, 
  X, 
  Plus,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ProductFormData {
  name: string
  description: string
  price: string
  originalPrice: string
  category: string
  subcategory: string
  sizes: string[]
  colors: Array<{ name: string; hex: string; inStock: boolean }>
  inventory: Array<{ size: string; color: string; quantity: string; reserved: string }>
  tags: string[]
  features: string[]
  care: string[]
  materials: string[]
  isNewArrival: boolean
  isSale: boolean
  isFeatured: boolean
  isActive: boolean
  salePercentage: number
  images: Array<{ 
    url?: string; 
    alt: string; 
    isPrimary: boolean; 
    file?: File | null; 
    preview?: string;
    publicId?: string;
  }>
}

interface AdminEditProductClientProps {
  productId: string
}

const AdminEditProductClient = ({ productId }: AdminEditProductClientProps) => {
  const router = useRouter()
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    sizes: [],
    colors: [{ name: '', hex: '#000000', inStock: true }],
    inventory: [],
    tags: [],
    features: [''],
    care: [''],
    materials: [''],
    isNewArrival: false,
    isSale: false,
    isFeatured: false,
    isActive: true,
    salePercentage: 0,
    images: [{ url: '', alt: '', isPrimary: true, file: null, preview: '' }]
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    'T-Shirts', 'Jeans', 'Blazers', 'Dresses', 'Hoodies', 
    'Pants', 'Polo Shirts', 'Jackets'
  ]

  const availableSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'
  ]

  // Update inventory when sizes or colors change
  useEffect(() => {
    const newInventory: Array<{ size: string; color: string; quantity: string; reserved: string }> = []
    
    formData.sizes.forEach(size => {
      formData.colors.forEach(color => {
        if (color.name.trim()) {
          const existing = formData.inventory.find(
            item => item.size === size && item.color === color.name
          )
          newInventory.push({
            size,
            color: color.name,
            quantity: existing?.quantity || '',
            reserved: existing?.reserved || ''
          })
        }
      })
    })
    
    setFormData(prev => ({ ...prev, inventory: newInventory }))
  }, [formData.sizes, formData.colors])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.data
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          originalPrice: product.originalPrice?.toString() || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          sizes: product.sizes || [],
          colors: product.colors?.length > 0 ? product.colors : [{ name: '', hex: '#000000', inStock: true }],
          inventory: product.inventory?.map((item: any) => ({
            ...item,
            quantity: item.quantity?.toString() || '',
            reserved: item.reserved?.toString() || ''
          })) || [],
          tags: product.tags || [],
          features: product.features?.length > 0 ? product.features : [''],
          care: product.care?.length > 0 ? product.care : [''],
          materials: product.materials || [],
          isNewArrival: product.isNewArrival || false,
          isSale: product.isSale || false,
          isFeatured: product.isFeatured || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          salePercentage: product.salePercentage || 0,
          images: product.images?.length > 0 ? product.images.map((img: any) => ({
            url: img.url,
            alt: img.alt || '',
            isPrimary: img.isPrimary || false,
            file: null,
            preview: img.url,
            publicId: img.publicId
          })) : [{ url: '', alt: '', isPrimary: true, file: null, preview: '' }]
        })
      } else {
        setErrors({ message: 'Failed to fetch product' })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setErrors({ message: 'An error occurred while fetching the product' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayFieldChange = (field: keyof ProductFormData, index: number, value: any) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as any[])]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  const addArrayItem = (field: keyof ProductFormData) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as any[])]
      if (field === 'features' || field === 'care' || field === 'materials') {
        newArray.push('')
      } else if (field === 'colors') {
        newArray.push({ name: '', hex: '#000000', inStock: true })
      } else if (field === 'images') {
        newArray.push({ url: '', alt: '', isPrimary: false, file: null, preview: '' })
      }
      return { ...prev, [field]: newArray }
    })
  }

  const removeArrayItem = (field: keyof ProductFormData, index: number) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as any[])]
      newArray.splice(index, 1)
      return { ...prev, [field]: newArray }
    })
  }

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      handleArrayFieldChange('images', index, { 
        ...formData.images[index], 
        file, 
        preview 
      })
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = (index: number) => {
    if (formData.images[index].isPrimary && formData.images.length > 1) {
      // If removing primary image, make the first remaining image primary
      const newImages = formData.images.filter((_, i) => i !== index)
      if (newImages.length > 0) {
        newImages[0].isPrimary = true
      }
      setFormData(prev => ({ ...prev, images: newImages }))
    } else {
      removeArrayItem('images', index)
    }
  }

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  const handleInventoryChange = (size: string, color: string, field: 'quantity' | 'reserved', value: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.size === size && item.color === color
          ? { ...item, [field]: value }
          : item
      )
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.sizes.length === 0) newErrors.sizes = 'At least one size is required'
    if (formData.colors.some(c => !c.name.trim())) newErrors.colors = 'All colors must have names'
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    setErrors({})

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/account')
        return
      }

      // Handle new image uploads if any
      const newImages = formData.images.filter(img => img.file)
      let uploadedImages = formData.images.filter(img => img.url) // Existing images

      if (newImages.length > 0) {
        const formDataToSend = new FormData()
        newImages.forEach((img, index) => {
          if (img.file) {
            formDataToSend.append(`images`, img.file)
            formDataToSend.append(`imageData[${index}]`, JSON.stringify({
              alt: img.alt,
              isPrimary: img.isPrimary
            }))
          }
        })

        // Upload new images
        const uploadResponse = await fetch('http://localhost:5001/api/products/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.message || 'Failed to upload images')
        }

        const uploadResult = await uploadResponse.json()
        uploadedImages = [...uploadedImages, ...uploadResult.data.images]
      }

      // Update the product
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        images: uploadedImages,
        inventory: formData.inventory
          .filter(item => item.quantity && parseFloat(item.quantity) > 0)
          .map(item => ({
            ...item,
            quantity: parseFloat(item.quantity) || 0,
            reserved: parseFloat(item.reserved) || 0
          }))
      }

      const response = await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        const data = await response.json()
        setErrors(data.errors || { message: 'Failed to update product' })
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setErrors({ message: error instanceof Error ? error.message : 'An error occurred while updating the product' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 border border-gray-200 rounded-lg">
        <div>
          <h1 className="text-3xl font-light text-black tracking-[0.1em]">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information and details</p>
        </div>
        <button
          onClick={() => router.back()}
          className="border border-gray-300 text-black px-6 py-2 font-medium hover:bg-gray-50 transition-colors rounded-md"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium text-black mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
                placeholder="Enter product name"
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full border border-gray-300 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.price && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.price}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Original Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  className="w-full border border-gray-300 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
                  placeholder="0.00 (optional)"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Leave empty if not on sale</p>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-black mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
              placeholder="Describe your product in detail..."
              required
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Image Management */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium text-black mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Product Images
          </h2>
          
          {errors.images && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.images}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative">
                    {image.preview ? (
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">No Image</span>
                      </div>
                    )}
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                        Primary
                      </div>
                    )}
                  </div>

                  {/* Image Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(index, file)
                          }
                        }}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        disabled={image.isPrimary}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          image.isPrimary
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Set Primary
                      </button>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Alt text for accessibility"
                      value={image.alt}
                      onChange={(e) => handleArrayFieldChange('images', index, { ...image, alt: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('images')}
              className="flex items-center gap-2 text-black hover:text-gray-700 transition-colors border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Add Another Image
            </button>
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium text-black mb-6">Product Options</h2>
          <div className="space-y-6">
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Available Sizes <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const newSizes = formData.sizes.includes(size)
                        ? formData.sizes.filter(s => s !== size)
                        : [...formData.sizes, size]
                      handleInputChange('sizes', newSizes)
                    }}
                    className={`px-4 py-2 border text-sm font-medium transition-colors rounded-md ${
                      formData.sizes.includes(size)
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {errors.sizes && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.sizes}
                </p>
              )}
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">Colors</label>
              <div className="space-y-3">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
                    <input
                      type="text"
                      placeholder="Color name (e.g., Navy Blue)"
                      value={color.name}
                      onChange={(e) => handleArrayFieldChange('colors', index, { ...color, name: e.target.value })}
                      className="flex-1 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md"
                    />
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleArrayFieldChange('colors', index, { ...color, hex: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={color.inStock}
                        onChange={(e) => handleArrayFieldChange('colors', index, { ...color, inStock: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">In Stock</span>
                    </label>
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('colors', index)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('colors')}
                  className="flex items-center gap-2 text-black hover:text-gray-700 transition-colors border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Color
                </button>
              </div>
              {errors.colors && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.colors}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        {formData.sizes.length > 0 && formData.colors.some(c => c.name.trim()) && (
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-medium text-black mb-6">Inventory Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Color</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reserved</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.inventory.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{item.size}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: formData.colors.find(c => c.name === item.color)?.hex }}
                          />
                          {item.color}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleInventoryChange(item.size, item.color, 'quantity', e.target.value)}
                          className="w-20 border border-gray-300 px-2 py-1 rounded text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={item.reserved}
                          onChange={(e) => handleInventoryChange(item.size, item.color, 'reserved', e.target.value)}
                          className="w-20 border border-gray-300 px-2 py-1 rounded text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Inventory is automatically calculated based on your selected sizes and colors
            </p>
          </div>
        )}

        {/* Product Features */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium text-black mb-6">Product Features</h2>
          <div className="space-y-6">
            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">Features</label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayFieldChange('features', index, e.target.value)}
                      className="flex-1 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md"
                      placeholder="Enter a feature (e.g., Breathable fabric, Quick-dry technology)"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="flex items-center gap-2 text-black hover:text-gray-700 transition-colors border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">Care Instructions</label>
              <div className="space-y-2">
                {formData.care.map((care, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={care}
                      onChange={(e) => handleArrayFieldChange('care', index, e.target.value)}
                      className="flex-1 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md"
                      placeholder="Enter care instruction (e.g., Machine wash cold, Tumble dry low)"
                    />
                    {formData.care.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('care', index)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('care')}
                  className="flex items-center gap-2 text-black hover:text-gray-700 transition-colors border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Care Instruction
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Settings */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-medium text-black mb-6">Product Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                />
                <span className="text-sm font-medium text-black">Active Product</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                />
                <span className="text-sm font-medium text-black">Featured Product</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => handleInputChange('isNewArrival', e.target.checked)}
                  className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                />
                <span className="text-sm font-medium text-black">New Arrival</span>
              </label>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isSale}
                  onChange={(e) => handleInputChange('isSale', e.target.checked)}
                  className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                />
                <span className="text-sm font-medium text-black">On Sale</span>
              </label>
              {formData.isSale && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Sale Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.salePercentage}
                      onChange={(e) => handleInputChange('salePercentage', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-md"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end bg-white p-6 border border-gray-200 rounded-lg">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-md"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Updating Product...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {errors.message && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.message}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminEditProductClient
