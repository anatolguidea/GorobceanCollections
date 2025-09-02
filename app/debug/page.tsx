'use client'

import { useState, useEffect } from 'react'
import { getImageUrl, loadImageWithFallback } from '../../utils/imageUtils'

const DebugPage = () => {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const testImagePath = '/uploads/products/images-1755796881715-495311075.webp'
  const expectedUrl = 'http://localhost:5001/uploads/products/images-1755796881715-495311075.webp'
  
  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    
    const results = []
    
    // Test 1: URL construction
    try {
      const constructedUrl = getImageUrl(testImagePath)
      results.push({
        test: 'URL Construction',
        status: constructedUrl === expectedUrl ? 'PASS' : 'FAIL',
        expected: expectedUrl,
        actual: constructedUrl,
        details: constructedUrl === expectedUrl ? 'URL constructed correctly' : 'URL construction failed'
      })
    } catch (error) {
      results.push({
        test: 'URL Construction',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Test 2: Image loading with fallback
    try {
      await new Promise((resolve) => {
        loadImageWithFallback(
          testImagePath,
          (url) => {
            results.push({
              test: 'Image Loading',
              status: 'PASS',
              details: `Image loaded successfully from ${url}`
            })
            resolve(true)
          },
          (error) => {
            results.push({
              test: 'Image Loading',
              status: 'FAIL',
              details: error
            })
            resolve(true)
          }
        )
      })
    } catch (error) {
      results.push({
        test: 'Image Loading',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Test 3: Direct fetch test
    try {
      const response = await fetch(expectedUrl, { mode: 'cors' })
      results.push({
        test: 'Direct Fetch',
        status: response.ok ? 'PASS' : 'FAIL',
        statusCode: response.status,
        statusText: response.statusText,
        details: response.ok ? 'Image accessible via fetch' : `Fetch failed with ${response.status}`
      })
    } catch (error) {
      results.push({
        test: 'Direct Fetch',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Test 4: CORS headers check
    try {
      const response = await fetch(expectedUrl, { method: 'OPTIONS' })
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      }
      
      results.push({
        test: 'CORS Headers',
        status: corsHeaders['Access-Control-Allow-Origin'] ? 'PASS' : 'FAIL',
        details: corsHeaders,
        expected: 'CORS headers should be present'
      })
    } catch (error) {
      results.push({
        test: 'CORS Headers',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    setTestResults(results)
    setLoading(false)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Loading Debug</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Test Image Path:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testImagePath}</code></div>
            <div><strong>Expected URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{expectedUrl}</code></div>
            <div><strong>Backend URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5001</code></div>
            <div><strong>Frontend URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.status === 'PASS' ? 'border-green-200 bg-green-50' :
                  result.status === 'FAIL' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                      result.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  
                  {result.details && (
                    <div className="text-sm">
                      {typeof result.details === 'string' ? (
                        <p>{result.details}</p>
                      ) : (
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mt-2">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.expected && result.actual && (
                    <div className="text-sm mt-2">
                      <div><strong>Expected:</strong> <code className="bg-gray-100 px-1 rounded">{result.expected}</code></div>
                      <div><strong>Actual:</strong> <code className="bg-gray-100 px-1 rounded">{result.actual}</code></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Test Image Display</h3>
              <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={expectedUrl}
                  alt="Test product image"
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('✅ Manual test: Image loaded successfully!')}
                  onError={(e) => console.error('❌ Manual test: Image failed to load:', e)}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Console Logs</h3>
              <p className="text-sm text-gray-600">
                Open your browser's developer console to see detailed logs about the image loading process.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Network Tab</h3>
              <p className="text-sm text-gray-600">
                Check the Network tab in your browser's developer tools to see if the image request is being made and what the response is.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPage
