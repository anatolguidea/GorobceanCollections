import { Metadata } from 'next'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import NewestProducts from '@/components/NewestProducts'
import Categories from '@/components/Categories'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  title: 'Gorobcean Collections - Premium Fashion',
  description: 'Discover the latest trends in fashion with Gorobcean Collections. Premium quality clothing for the modern lifestyle.',
  keywords: 'clothing, fashion, style, premium, brand, ecommerce, gorobcean, collections',
  openGraph: {
    title: 'Gorobcean Collections - Premium Fashion',
    description: 'Discover the latest trends in fashion with Gorobcean Collections.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HomeClient>
        <Hero />
        <FeaturedProducts />
        <NewestProducts />
        <Categories />
        <Newsletter />
      </HomeClient>
      <Footer />
    </main>
  )
}
