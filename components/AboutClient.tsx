'use client'

import { motion } from 'framer-motion'
import { Users, Award, Globe, Heart, Shield, Truck } from 'lucide-react'

const AboutClient = () => {
  const stats = [
    { number: '10K+', label: 'Happy Customers', icon: Users },
    { number: '500+', label: 'Products', icon: Award },
    { number: '50+', label: 'Countries', icon: Globe },
    { number: '5+', label: 'Years', icon: Heart }
  ]

  const values = [
    {
      icon: Shield,
      title: 'Quality First',
      description: 'We never compromise on quality. Every piece is crafted with premium materials and attention to detail.'
    },
    {
      icon: Heart,
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We listen to feedback and continuously improve our products and service.'
    },
    {
      icon: Globe,
      title: 'Sustainable Fashion',
      description: 'We\'re committed to reducing our environmental impact through responsible sourcing and eco-friendly practices.'
    },
    {
      icon: Truck,
      title: 'Fast & Reliable',
      description: 'Quick delivery and excellent customer support ensure you get what you need when you need it.'
    }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: 'Former fashion designer with 15+ years in the industry. Passionate about creating accessible luxury.'
    },
    {
      name: 'Michael Chen',
      role: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'Award-winning designer who believes fashion should be both beautiful and functional.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Operations expert ensuring smooth processes and exceptional customer experiences.'
    },
    {
      name: 'David Kim',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Digital marketing specialist focused on building meaningful connections with our community.'
    }
  ]

  return (
    <main className="pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-light mb-6 tracking-[0.1em]">
              Our Story
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto font-light tracking-wide">
              Building a fashion brand that celebrates individuality, quality, and sustainable style
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-black mb-6 tracking-[0.1em]">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light tracking-wide">
              To democratize luxury fashion by creating high-quality, sustainable clothing that empowers individuals to express their unique style while maintaining the highest standards of craftsmanship and ethical production.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-light text-black mb-2 tracking-wide">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-light tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-black mb-6 tracking-[0.1em]">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 p-8"
              >
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-black mb-4 tracking-wide">
                  {value.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-black mb-6 tracking-[0.1em]">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light tracking-wide">
              The passionate individuals behind our brand who work tirelessly to bring you the best fashion experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-6 overflow-hidden border border-gray-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium text-black mb-2 tracking-wide">
                  {member.name}
                </h3>
                <p className="text-gray-500 mb-3 font-light tracking-wide">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm font-light leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-light text-black mb-6 tracking-[0.1em]">
                How It All Began
              </h2>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>
                  Founded in 2019, Gorobcean Collections started as a small passion project in a New York apartment. Our founder, Sarah Johnson, was frustrated with the lack of quality, affordable fashion that didn't compromise on style or ethics.
                </p>
                <p>
                  What began as a collection of 10 carefully crafted pieces has grown into a beloved brand with thousands of customers worldwide. We've maintained our commitment to quality while expanding our reach and influence in the fashion industry.
                </p>
                <p>
                  Today, we continue to push boundaries in sustainable fashion, always keeping our customers at the heart of every decision we make.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-100 h-96 flex items-center justify-center"
            >
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-lg font-light">Our Story</p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AboutClient
