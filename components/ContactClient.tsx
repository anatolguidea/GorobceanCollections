'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, ShoppingBag } from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const ContactClient = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@gorobcean.com', 'support@gorobcean.com'],
      description: 'We typically respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      description: 'Monday - Friday, 9AM - 6PM EST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Fashion Street', 'New York, NY 10001'],
      description: 'By appointment only'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM-6PM', 'Sat: 10AM-4PM'],
      description: 'Closed on Sundays'
    }
  ]

  const supportTopics = [
    {
      icon: ShoppingBag,
      title: 'Order Support',
      description: 'Help with orders, shipping, and returns',
      link: '/support/orders'
    },
    {
      icon: MessageCircle,
      title: 'Product Questions',
      description: 'Get information about our products',
      link: '/support/products'
    },
    {
      icon: HelpCircle,
      title: 'General Help',
      description: 'General questions and assistance',
      link: '/support/general'
    }
  ]

  const updateForm = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Contact form submitted:', formData)
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-light text-black tracking-[0.1em] mb-6">
            CONTACT US
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light tracking-wide">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-medium text-black mb-6 tracking-wide">Send us a Message</h2>
            
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-medium text-black mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => updateForm('subject', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => updateForm('message', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all duration-200 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-white border border-gray-200"
                >
                  <div className="p-3 bg-black text-white rounded-none">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black mb-2 tracking-wide">{item.title}</h3>
                    <div className="space-y-1">
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-gray-600 font-light">{detail}</p>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-light">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Support Topics */}
            <div>
              <h3 className="text-xl font-medium text-black mb-4 tracking-wide">Need Help?</h3>
              <div className="space-y-4">
                {supportTopics.map((topic, index) => (
                  <motion.div
                    key={topic.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="p-4 bg-white border border-gray-200 hover:border-black transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 group-hover:bg-black transition-colors duration-200">
                        <topic.icon className="w-5 h-5 text-black group-hover:text-white transition-colors duration-200" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black group-hover:text-gray-600 transition-colors duration-200">
                          {topic.title}
                        </h4>
                        <p className="text-sm text-gray-600 font-light">{topic.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

export default ContactClient
