import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WishlistClient from '@/components/WishlistClient'

export const metadata: Metadata = {
  title: 'My Wishlist - Gorobcean Collections',
  description: 'View and manage your saved items. Add products to cart, remove from wishlist, and organize your favorite fashion pieces.',
  keywords: 'wishlist, saved items, favorites, gorobcean, collections',
  openGraph: {
    title: 'My Wishlist - Gorobcean Collections',
    description: 'View and manage your saved items.',
    type: 'website',
  },
}

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WishlistClient />
      <Footer />
    </div>
  )
}
