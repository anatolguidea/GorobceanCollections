import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartClient from '@/components/CartClient'

export const metadata: Metadata = {
  title: 'Shopping Cart - Gorobcean Collections',
  description: 'Review and manage your shopping cart items. Update quantities, remove items, and proceed to secure checkout.',
  keywords: 'shopping cart, cart, checkout, order, gorobcean, collections',
  openGraph: {
    title: 'Shopping Cart - Gorobcean Collections',
    description: 'Review and manage your shopping cart items.',
    type: 'website',
  },
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CartClient />
      <Footer />
    </div>
  )
}
