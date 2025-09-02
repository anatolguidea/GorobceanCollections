import { Metadata } from 'next'
import AdminEditProductClient from '@/components/AdminEditProductClient'

export const metadata: Metadata = {
  title: 'Edit Product | Admin Dashboard | Gorobcean Collections',
  description: 'Edit product information in the admin dashboard.',
  keywords: 'admin, products, edit, update, management',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Edit Product | Admin Dashboard | Gorobcean Collections',
    description: 'Edit product information in the admin dashboard.',
    type: 'website',
  },
}

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return <AdminEditProductClient productId={params.id} />
}
