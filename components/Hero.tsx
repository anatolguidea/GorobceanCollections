'use client'

import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Hero Video */}
      <div className="relative w-full h-screen">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/fashion.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  )
}

export default Hero
