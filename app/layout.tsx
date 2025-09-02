import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gorobcean Collections - Premium Fashion',
  description: 'Discover the latest trends in fashion with Gorobcean Collections. Premium quality clothing for the modern lifestyle.',
  keywords: 'clothing, fashion, style, premium, brand, ecommerce',
  authors: [{ name: 'Gorobcean Collections Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  )
}
