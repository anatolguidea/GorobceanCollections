import { Metadata } from 'next'
import ProductClient from '@/components/ProductClient'

export const metadata: Metadata = {
  title: 'Product Details | Gorobcean Collections',
  description: 'Discover the finest details of our premium fashion products. Explore materials, care instructions, and customer reviews.',
  keywords: 'product details, fashion, premium clothing, materials, care instructions',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Product Details | Gorobcean Collections',
    description: 'Discover the finest details of our premium fashion products.',
    type: 'website',
  },
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductClient />
}
