'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        
        {/* Left content */}
        <div className="max-w-xl">

            <p className="text-1xl md:text-1xl font-extrabold leading-tight text-gray-900 mb-6">This is just for demonstration. A rough design for POC</p>
            <br /><br />
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
            All-in-One<br />
            <span className="text-blue-600">Tracking & Delivery</span> Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Deliver smarter, track better, and optimize operations – all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white text-sm px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-block border border-blue-600 text-blue-600 text-sm px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              View Features
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="w-full md:w-1/2">
          <Image
            src="/hero-image.png"
            alt="Hero graphic"
            width={600}
            height={400}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  )
}
