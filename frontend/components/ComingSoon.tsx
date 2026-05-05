'use client'

import { motion } from 'framer-motion'
// import './comingsoon.css' // we'll add this file for styles

export default function ComingSoon() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl text-blue-600 font-extrabold shine-text shine-effect "
      >
        Coming Soon 🚀
      </motion.h1>
    </main>
  )
}


