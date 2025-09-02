'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  User, 
  Calendar,
  DollarSign,
  Package,
  Edit,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Clock
} from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

interface Order {
  _id: string
  orderNumber: string
  customerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: Array<{
    product: {
      name: string
      price: number
      images: Array<{ url: string }>
    }
    quantity: number
    size: string
    color: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  status: string
  adminNotes: string
  createdAt: string
  estimatedDelivery?: string
  actualDelivery?: string
}

const AdminOrdersClient = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5001/api/orders/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.data?.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-indigo-100 text-indigo-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5001/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrders()
        setShowStatusModal(false)
        setSelectedOrder(null)
        setNewStatus('')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const closeAllModals = () => {
    setShowStatusModal(false)
    setShowDetailsModal(false)
    setSelectedOrder(null)
    setNewStatus('')
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
      <div>
        <h1 className="text-2xl font-light text-black tracking-[0.1em]">Orders Management</h1>
        <p className="text-gray-600 mt-2">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                {orders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-black">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
              <p className="text-sm text-gray-600">Shipped Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-600">{order.items.length} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">
                        {order.customerDetails.firstName} {order.customerDetails.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{order.customerDetails.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">${order.total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowDetailsModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setNewStatus(order.status)
                          setShowStatusModal(true)
                        }}
                        className="text-gray-600 hover:text-black transition-colors"
                        title="Edit Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-black">Update Order Status</h2>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Order #{selectedOrder.orderNumber}</label>
                <p className="text-sm text-gray-600">
                  Customer: {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateOrderStatus}
                  className="flex-1 bg-black text-white py-2 font-medium hover:bg-gray-800 transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={closeAllModals}
                  className="flex-1 border border-gray-300 text-black py-2 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium text-black">Order Details</h2>
                <button
                  onClick={closeAllModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
              </button>
              </div>
              <p className="text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span>{selectedOrder.items.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.customerDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedOrder.customerDetails.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span>${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-black">Total:</span>
                      <span className="text-black">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-black mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800">
                    {selectedOrder.customerDetails.address}<br />
                    {selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} {selectedOrder.customerDetails.zipCode}<br />
                    {selectedOrder.customerDetails.country}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium text-black mb-3">Order Items</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                {item.product.images && item.product.images[0] ? (
                                  <img 
                                    src={getImageUrl(item.product.images[0].url)} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <Package className={`w-6 h-6 text-gray-400 ${item.product.images && item.product.images[0] ? 'hidden' : ''}`} />
                              </div>
                              <div>
                                <div className="font-medium text-black">{item.product.name}</div>
                                <div className="text-sm text-gray-600">${item.product.price.toFixed(2)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.size}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.color}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">${item.product.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-black">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-black mb-3">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-800">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                
                {selectedOrder.adminNotes && (
                  <div>
                    <h3 className="font-medium text-black mb-3">Admin Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-800">{selectedOrder.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setNewStatus(selectedOrder.status)
                    setShowStatusModal(true)
                  }}
                  className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition-colors"
                >
                  Edit Status
                </button>
                <button
                  onClick={closeAllModals}
                  className="border border-gray-300 text-black px-6 py-2 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersClient
