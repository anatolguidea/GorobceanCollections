'use client'

import { motion } from 'framer-motion'

interface HomeClientProps {
  children: React.ReactNode
}

const HomeClient = ({ children }: HomeClientProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export default HomeClient
