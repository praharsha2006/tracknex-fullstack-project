'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="TrackNex Logo" width={44} height={44} />
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">TrackNex</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700  text-sm font-medium">
          <Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
          <Link href="/industries" className="hover:text-blue-600 transition-colors">Industries</Link>
          <Link href="/resources" className="hover:text-blue-600 transition-colors">Resources</Link>
        </nav>
        

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600 font-semibold">
            Login
          </Link>
          <Link href="/register" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg shadow hover:opacity-90 transition">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-gray-700">
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden backdrop-blur-lg bg-white/30 border border-white/20 rounded-xl shadow-lg px-6 pt-4 pb-6 space-y-4 text-sm font-medium text-gray-700">
          <Link href="/features" onClick={() => setMenuOpen(false)} className="block">Features</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block">Pricing</Link>
          <Link href="/solutions" onClick={() => setMenuOpen(false)} className="block">Solutions</Link>
          <Link href="/industries" onClick={() => setMenuOpen(false)} className="block">Industries</Link>
          <Link href="/resources" onClick={() => setMenuOpen(false)} className="block">Resources</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="block bg-blue-600 text-white text-center px-4 py-2 rounded-md shadow hover:opacity-90 transition">
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}
