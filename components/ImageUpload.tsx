'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  images: Array<{ url: string; alt: string; isPrimary: boolean; file?: File }>
  onImagesChange: (images: Array<{ url: string; alt: string; isPrimary: boolean; file?: File }>) => void
  maxImages?: number
}

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug logging when images prop changes
  useEffect(() => {
    console.log('📸 ImageUpload received images:', {
      total: images.length,
      images: images.map(img => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        hasFile: !!img.file,
        startsWithUploads: img.url?.startsWith('/uploads/'),
        startsWithBlob: img.url?.startsWith('blob:')
      }))
    })
  }, [images])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [images])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newImages = Array.from(files).map((file, index) => ({
      url: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      isPrimary: false, // We'll set primary after filtering
      file: file
    }))

    // Filter out placeholder/empty images and ensure we only keep valid images
    // When editing, preserve existing images that don't have files (they're already uploaded)
    const existingRealImages = images.filter(img => 
      (img.file && img.file instanceof File) || // New images with files
      (img.url && !img.url.startsWith('blob:') && img.url.startsWith('/uploads/')) // Existing uploaded images
    )
    
    console.log('📸 ImageUpload - Filtering images:', {
      original: images.length,
      filtered: existingRealImages.length,
      details: images.map(img => ({
        url: img.url,
        hasFile: !!img.file,
        startsWithUploads: img.url?.startsWith('/uploads/'),
        startsWithBlob: img.url?.startsWith('blob:'),
        kept: (img.file && img.file instanceof File) || (img.url && !img.url.startsWith('blob:') && img.url.startsWith('/uploads/'))
      }))
    })
    
    // Combine existing real images with new images
    let updatedImages = [...existingRealImages, ...newImages].slice(0, maxImages)
    
    // Ensure at least one image is primary
    if (updatedImages.length > 0) {
      const hasPrimary = updatedImages.some(img => img.isPrimary)
      if (!hasPrimary) {
        updatedImages[0].isPrimary = true
      }
    }
    
    console.log('📸 ImageUpload - Updated images:', {
      total: updatedImages.length,
      withFiles: updatedImages.filter(img => img.file).length,
      existing: updatedImages.filter(img => !img.file && img.url.startsWith('/uploads/')).length,
      primary: updatedImages.find(img => img.isPrimary)?.alt
    })
    
    onImagesChange(updatedImages)
  }

  const removeImage = (index: number) => {
    // Clean up blob URL if it exists
    if (images[index].url && images[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(images[index].url)
    }
    
    const newImages = images.filter((_, i) => i !== index)
    // If we're removing the primary image, make the first remaining image primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    onImagesChange(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-sm text-gray-600 mb-2">
            <button
              type="button"
              onClick={openFileDialog}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Click to upload
            </button>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                {image.url ? (
                  <img
                    src={image.url.startsWith('/uploads/') ? `http://localhost:5001${image.url}` : image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', e.currentTarget.src)
                      console.error('Original URL:', image.url)
                                              e.currentTarget.src = '/images/products/fashion.webp'
                    }}
                    onLoad={(e) => {
                      console.log('✅ Image loaded successfully:', e.currentTarget.src)
                    }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </div>
                )}
                
                              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 z-10 shadow-lg"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
              </div>
              
              {/* Alt Text Input */}
              <div className="mt-2 space-y-2 relative z-20">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => {
                    const newImages = [...images]
                    newImages[index].alt = e.target.value
                    onImagesChange(newImages)
                  }}
                  placeholder="Alt text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
                
                {/* Primary Toggle */}
                <label className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    onChange={(e) => setPrimaryImage(index)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Primary image</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p>• Upload high-quality product images (recommended: 800x800px or larger)</p>
        <p>• First image will be set as primary automatically</p>
        <p>• You can change the primary image by clicking "Set Primary"</p>
        <p>• Maximum {maxImages} images allowed</p>
      </div>
    </div>
  )
}

export default ImageUpload
