'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../utils/api'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut
} from 'lucide-react'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/account?returnTo=/admin')
        return
      }

      const response = await api.auth.getProfile()
      console.log('Admin layout auth check:', response)

      if (response.success && response.data && response.data.success && response.data.data) {
        if (response.data.data.role === 'admin') {
          setUser(response.data.data)
          setIsAdmin(true)
          console.log('Admin access granted')
        } else {
          console.log('Not admin, redirecting')
          router.push('/?error=unauthorized')
        }
      } else {
        console.log('Auth failed, redirecting to login')
        localStorage.removeItem('token')
        router.push('/account?returnTo=/admin')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/account?returnTo=/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      description: 'Overview and statistics'
    },
    {
      icon: Package,
      label: 'Products',
      href: '/admin/products',
      description: 'Manage product catalog'
    },
    {
      icon: Users,
      label: 'Users',
      href: '/admin/users',
      description: 'Manage user accounts'
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      href: '/admin/orders',
      description: 'View and manage orders'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-0">
        <div className="flex">
          {/* Sidebar */}
          <aside
            className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0"
          >
            <div className="p-6">
              {/* Admin Header */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Link href="/" className="flex flex-col items-start hover:opacity-80 transition-opacity">
                    <span className="text-xl font-bold text-black tracking-wider">GOROBEAN</span>
                    <span className="text-sm text-black tracking-widest">COLLECTIONS</span>
                  </Link>
                </div>
                <h2 className="text-lg font-semibold text-black mt-4">Admin Panel</h2>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-none transition-colors duration-200 text-black hover:bg-gray-50 border-l-2 border-transparent hover:border-black"
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium tracking-wide">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              {/* Admin Profile Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="mb-4 p-3 bg-gray-50 rounded-none">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-white px-2 py-1 border border-gray-200">
                    Role: Admin
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-black hover:bg-gray-50 rounded-none transition-colors duration-200 w-full border-l-2 border-transparent hover:border-black"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="ml-64 flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
