import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetailClient from '@/components/ProductDetailClient'

export const metadata: Metadata = {
  title: 'Product Details - Gorobcean Collections',
  description: 'Discover the finest details of our premium fashion products. Explore materials, care instructions, and customer reviews.',
  keywords: 'product details, fashion, premium clothing, materials, care instructions, gorobcean, collections',
  openGraph: {
    title: 'Product Details - Gorobcean Collections',
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
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductDetailClient productId={params.id} />
      <Footer />
    </div>
  )
}
