'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Notification = ({ message, type, isVisible, onClose, duration = 3000 }: NotificationProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-20 right-4 z-50 max-w-sm w-full ${
          type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${
                type === 'success' 
                  ? 'bg-green-50 text-green-500 hover:bg-green-100' 
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              } transition-colors duration-200`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Notification









