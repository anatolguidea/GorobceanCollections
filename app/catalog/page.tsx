import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CatalogClient from '@/components/CatalogClient'

export const metadata: Metadata = {
  title: 'Catalog - Gorobcean Collections',
  description: 'Discover our complete collection of premium fashion categories. Browse all product categories and find your perfect style.',
  keywords: 'catalog, categories, fashion categories, clothing categories, style, premium, brand, ecommerce',
  openGraph: {
    title: 'Catalog - Gorobcean Collections',
    description: 'Discover our complete collection of premium fashion categories.',
    type: 'website',
  },
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CatalogClient />
      <Footer />
    </div>
  )
}
