import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AccountClient from '@/components/AccountClient'

export const metadata: Metadata = {
  title: 'Account - Gorobcean Collections',
  description: 'Sign in to your account or create a new one. Manage your profile, orders, wishlist, and addresses.',
  keywords: 'account, login, sign up, profile, orders, wishlist, addresses, gorobcean, collections',
  openGraph: {
    title: 'Account - Gorobcean Collections',
    description: 'Sign in to your account or create a new one.',
    type: 'website',
  },
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AccountClient />
      <Footer />
    </div>
  )
}
