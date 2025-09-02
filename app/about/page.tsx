import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AboutClient from '@/components/AboutClient'

export const metadata: Metadata = {
  title: 'About Us - Gorobcean Collections',
  description: 'Learn about our story, mission, and the passionate team behind Gorobcean Collections. Discover how we\'re democratizing luxury fashion.',
  keywords: 'about us, our story, mission, team, gorobcean, collections, fashion brand',
  openGraph: {
    title: 'About Us - Gorobcean Collections',
    description: 'Learn about our story, mission, and the passionate team behind Gorobcean Collections.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AboutClient />
      <Footer />
    </div>
  )
}
