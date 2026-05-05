'use client'

import Link from 'next/link'
import { Facebook, Twitter, Linkedin } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & description */}
        <div>
          <div className="flex items-center mb-4">
            <Image src="/logo.png" alt="TrackNex" width={36} height={36} />
            <span className="text-white text-xl font-semibold ml-2">
              TrackNex
            </span>
          </div>
          <p className="text-sm">
            Deliver smarter, track better, and optimize operations – all in one place.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Contact</h4>
          <p className="text-sm">
            123 Main Street, Suite 400<br />
            New Delhi, India<br />
            support@tracknex.com
          </p>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-white">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TrackNex. All rights reserved.
      </div>
    </footer>
  )
}
