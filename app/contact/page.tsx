import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactClient from '@/components/ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us - Gorobcean Collections',
  description: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  keywords: 'contact, support, help, customer service, gorobcean, collections',
  openGraph: {
    title: 'Contact Us - Gorobcean Collections',
    description: 'Have questions? We\'d love to hear from you.',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ContactClient />
      <Footer />
    </div>
  )
}
