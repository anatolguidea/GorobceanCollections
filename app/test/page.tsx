'use client'

import Link from 'next/link'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Page</h1>
        <p className="text-lg text-gray-600 mb-8">This is a test page to verify routing is working.</p>
        
        <div className="space-y-4">
          <Link href="/" className="block text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
          
          <Link href="/products/68a6fb9f80e4cd0b5d81b13a" className="block text-blue-600 hover:text-blue-800">
            Test Product Link (Premium Cotton T-Shirt)
          </Link>
          
          <Link href="/categories" className="block text-blue-600 hover:text-blue-800">
            Test Categories Link
          </Link>
        </div>
      </div>
    </div>
  )
}
