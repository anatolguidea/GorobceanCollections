'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageUtils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  fill, 
  className = '', 
  sizes,
  priority = false,
  quality = 90,
  placeholder = 'empty',
  blurDataURL 
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const imageUrl = getImageUrl(src)
  const fallbackUrl = '/images/placeholder-product.svg'
  
  const handleError = () => {
    console.error('❌ Image failed to load:', imageUrl)
    setImageError(true)
    setIsLoading(false)
  }
  
  const handleLoad = () => {
    setIsLoading(false)
  }

  // If there's an error, show fallback
  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <img
          src={fallbackUrl}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        />
      </div>
    )
  }

  // Common props for both Next.js Image and fallback img
  const commonProps = {
    src: imageUrl,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
  }

  // Use Next.js Image for optimization when possible
  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    )
  }

  if (width && height) {
    return (
      <Image
        {...commonProps}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    )
  }

  // Fallback to regular img tag for cases where dimensions aren't specified
  return (
    <img
      {...commonProps}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    />
  )
}

export default OptimizedImage
