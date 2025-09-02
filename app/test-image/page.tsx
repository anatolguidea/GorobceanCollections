'use client'

import { useState } from 'react'

const TestImagePage = () => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  
  const testImageUrl = 'http://localhost:5001/uploads/products/images-1755796881715-495311075.webp'
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Testing Backend Image Loading</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Test Image URL:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {testImageUrl}
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Image Display Test:</h3>
              <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={testImageUrl}
                  alt="Test product image"
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    setImageLoaded(true)
                    setImageError(null)
                    console.log('✅ Image loaded successfully!')
                  }}
                  onError={(e) => {
                    setImageLoaded(false)
                    setImageError('Failed to load image')
                    console.error('❌ Image failed to load:', e)
                  }}
                  crossOrigin="anonymous"
                />
              </div>
              
              <div className="mt-4">
                {imageLoaded && (
                  <div className="text-green-600 font-medium">✅ Image loaded successfully!</div>
                )}
                {imageError && (
                  <div className="text-red-600 font-medium">❌ {imageError}</div>
                )}
                {!imageLoaded && !imageError && (
                  <div className="text-gray-500">Loading image...</div>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Manual Test:</h3>
              <p className="text-sm text-gray-600 mb-2">
                Try opening this URL directly in your browser:
              </p>
              <a 
                href={testImageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {testImageUrl}
              </a>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Console Logs:</h3>
              <p className="text-sm text-gray-600">
                Check your browser's developer console for detailed logs about the image loading process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestImagePage
