import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutClient from '@/components/CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout - Gorobcean Collections',
  description: 'Complete your purchase securely with our streamlined checkout process. Enter shipping, payment, and billing information.',
  keywords: 'checkout, payment, shipping, billing, order, gorobcean, collections',
  openGraph: {
    title: 'Checkout - Gorobcean Collections',
    description: 'Complete your purchase securely with our streamlined checkout process.',
    type: 'website',
  },
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CheckoutClient />
      <Footer />
    </div>
  )
}
