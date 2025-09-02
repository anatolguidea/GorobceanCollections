import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShopClient from '@/components/ShopClient'

export const metadata: Metadata = {
  title: 'NEW IN - Gorobcean Collections',
  description: 'Discover the latest arrivals and newest additions to our premium fashion collection. Fresh styles, updated daily.',
  keywords: 'new arrivals, latest fashion, new products, clothing, fashion, style, premium, brand, ecommerce',
  openGraph: {
    title: 'NEW IN - Gorobcean Collections',
    description: 'Discover the latest arrivals and newest additions to our premium fashion collection.',
    type: 'website',
  },
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ShopClient />
      <Footer />
    </div>
  )
}