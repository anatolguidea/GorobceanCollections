import { Metadata } from 'next'
import AdminLayout from './layout'
import AdminDashboardClient from '@/components/AdminDashboardClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Gorobcean Collections',
  description: 'Manage your store, products, orders, and customers from the admin dashboard.',
  keywords: 'admin, dashboard, management, gorobcean, collections',
  openGraph: {
    title: 'Admin Dashboard - Gorobcean Collections',
    description: 'Manage your store, products, orders, and customers.',
    type: 'website',
  },
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardClient />
    </AdminLayout>
  )
}
