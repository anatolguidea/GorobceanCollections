'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Eye,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  recentProducts: any[]
}

const AdminDashboardClient = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentProducts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Fetch products count
      const productsResponse = await fetch('http://localhost:5001/api/products?limit=100')
      const productsData = await productsResponse.json()
      
      // Fetch users count
      const usersResponse = await fetch('http://localhost:5001/api/users/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const usersData = await usersResponse.json()
      
      // Fetch orders count and revenue
      const ordersResponse = await fetch('http://localhost:5001/api/orders/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const ordersData = await ordersResponse.json()

      setStats({
        totalProducts: productsData.data?.pagination?.totalProducts || productsData.data?.products?.length || 0,
        totalUsers: usersData.data?.count || 0,
        totalOrders: ordersData.data?.count || 0,
        totalRevenue: ordersData.data?.totalRevenue || 0,
        recentProducts: productsData.data?.products?.slice(0, 5) || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-black',
      href: '/admin/products'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-black',
      href: '/admin/users'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-black',
      href: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-black',
      href: '/admin/orders'
    }
  ]

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-black tracking-[0.1em] mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 font-light tracking-wide">
          Welcome to your admin dashboard. Monitor your store's performance and manage your business.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} text-white flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mt-4"
              >
                View Details
                <Eye className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white border border-gray-200 p-6"
        >
          <h2 className="text-xl font-medium text-black mb-4 tracking-wide">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-4 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <span className="font-medium">Add New Product</span>
              <Plus className="w-5 h-5" />
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-4 border border-gray-300 text-black hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Manage Products</span>
              <Package className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white border border-gray-200 p-6"
        >
          <h2 className="text-xl font-medium text-black mb-4 tracking-wide">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <span className="text-sm text-gray-600">New order received</span>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <span className="text-sm text-gray-600">Product updated</span>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <span className="text-sm text-gray-600">New user registered</span>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-black tracking-wide">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            View All
          </Link>
        </div>
        
        {stats.recentProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-black">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-black">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-black">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-black">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 font-medium text-black">${product.price}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No products found</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center mt-2 text-black hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add your first product
            </Link>
          </div>
        )}
      </motion.div>

      {/* Analytics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white border border-gray-200 p-6 mt-6"
      >
        <h2 className="text-xl font-medium text-black mb-6 tracking-wide">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50">
            <TrendingUp className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Monthly Growth</p>
            <p className="text-2xl font-bold text-black">+12.5%</p>
          </div>
          <div className="text-center p-4 bg-gray-50">
            <Users className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">New Customers</p>
            <p className="text-2xl font-bold text-black">+24</p>
          </div>
          <div className="text-center p-4 bg-gray-50">
            <ShoppingCart className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-black">3.2%</p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default AdminDashboardClient
