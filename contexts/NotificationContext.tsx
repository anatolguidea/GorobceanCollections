'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X, ShoppingCart, AlertCircle, Info } from 'lucide-react'
import Image from 'next/image'

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  showCloseButton?: boolean
  productDetails?: {
    name: string
    image?: string
    price?: number
    size?: string
    color?: string
    quantity?: number
  }
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void
  hideNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationData = {
      id,
      duration: 4000,
      showCloseButton: true,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-hide notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id)
      }, newNotification.duration)
    }
  }, [])

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />
    }
  }

  const getNotificationStyles = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg'
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg'
      case 'warning':
        return 'bg-white border-l-4 border-yellow-500 shadow-lg'
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg'
      default:
        return 'bg-white border-l-4 border-green-500 shadow-lg'
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, clearAllNotifications }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
              className={`${getNotificationStyles(notification.type)} rounded-lg p-4 border border-gray-200`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'success' && notification.productDetails ? (
                    <ShoppingCart className="h-6 w-6 text-green-500" />
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Product Image for cart notifications */}
                  {notification.productDetails?.image && (
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={notification.productDetails.image}
                          alt={notification.productDetails.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {notification.productDetails.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {notification.productDetails.size && (
                            <span>Size: {notification.productDetails.size}</span>
                          )}
                          {notification.productDetails.color && (
                            <span>Color: {notification.productDetails.color}</span>
                          )}
                          {notification.productDetails.quantity && (
                            <span>Qty: {notification.productDetails.quantity}</span>
                          )}
                        </div>
                        {notification.productDetails.price && (
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            €{notification.productDetails.price.toFixed(2).replace('.', ',')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Regular notification content */}
                  {!notification.productDetails?.image && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </>
                  )}

                  {/* Action Button */}
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>

                {/* Close Button */}
                {notification.showCloseButton && (
                  <button
                    onClick={() => hideNotification(notification.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}
