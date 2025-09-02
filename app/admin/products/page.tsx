import { Metadata } from 'next'
import AdminProductsClient from '@/components/AdminProductsClient'

export const metadata: Metadata = {
  title: 'Products Management | Admin Dashboard | Gorobcean Collections',
  description: 'Manage your product catalog in the admin dashboard.',
  keywords: 'admin, products, management, catalog, inventory',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Products Management | Admin Dashboard | Gorobcean Collections',
    description: 'Manage your product catalog in the admin dashboard.',
    type: 'website',
  },
}

export default function AdminProductsPage() {
  return <AdminProductsClient />
}
