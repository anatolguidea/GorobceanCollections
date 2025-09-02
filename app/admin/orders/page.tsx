import { Metadata } from 'next'
import AdminOrdersClient from '@/components/AdminOrdersClient'

export const metadata: Metadata = {
  title: 'Orders Management | Admin Dashboard | Gorobcean Collections',
  description: 'Track and manage customer orders in the admin dashboard.',
  keywords: 'admin, orders, management, tracking, status',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Orders Management | Admin Dashboard | Gorobcean Collections',
    description: 'Track and manage customer orders in the admin dashboard.',
    type: 'website',
  },
}

export default function AdminOrdersPage() {
  return <AdminOrdersClient />
}
