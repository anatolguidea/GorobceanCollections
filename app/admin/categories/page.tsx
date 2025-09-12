import { Metadata } from 'next'
import AdminLayout from '../layout'
import AdminCategoriesClient from '@/components/AdminCategoriesClient'

export const metadata: Metadata = {
  title: 'Categories Management - Gorobcean Collections',
  description: 'Manage product categories and collections.',
  keywords: 'admin, categories, management, gorobcean, collections',
  openGraph: {
    title: 'Categories Management - Gorobcean Collections',
    description: 'Manage product categories and collections.',
    type: 'website',
  },
}

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <AdminCategoriesClient />
    </AdminLayout>
  )
}
