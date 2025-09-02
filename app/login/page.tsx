import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginClient from '@/components/LoginClient'

export const metadata: Metadata = {
  title: 'Sign In - Gorobcean Collections',
  description: 'Sign in to your account to access your wishlist, cart, and order history.',
  keywords: 'sign in, login, authentication, account, gorobcean, collections',
  openGraph: {
    title: 'Sign In - Gorobcean Collections',
    description: 'Sign in to your account to access your wishlist, cart, and order history.',
    type: 'website',
  },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <LoginClient />
      <Footer />
    </div>
  )
}
