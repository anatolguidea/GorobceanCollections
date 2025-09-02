import { Metadata } from 'next'
import AdminNewProductClient from '@/components/AdminNewProductClient'

export const metadata: Metadata = {
  title: 'Add New Product | Admin Dashboard | Gorobcean Collections',
  description: 'Create a new product for your catalog in the admin dashboard.',
  keywords: 'admin, products, create, new, catalog, management',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Add New Product | Admin Dashboard | Gorobcean Collections',
    description: 'Create a new product for your catalog in the admin dashboard.',
    type: 'website',
  },
}

export default function AdminNewProductPage() {
  return <AdminNewProductClient />
}
