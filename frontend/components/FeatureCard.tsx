'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  image: string
  reverse?: boolean
}

export default function FeatureCard({
  title,
  description,
  image,
  reverse = false,
}: FeatureCardProps) {
  return (
    <div
      className={`flex flex-col-reverse md:flex-row ${
        reverse ? 'md:flex-row-reverse' : ''
      } items-center gap-12 my-16`}
    >
      {/* Text content */}
      <div className="md:w-1/2">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 text-base mb-4">{description}</p>
        <button
          className="text-blue-600 hover:underline text-sm font-medium"
          disabled
        >
          Learn More →
        </button>
      </div>

      {/* Image */}
      <div className="md:w-1/2">
        <Image
          src={image}
          alt={title}
          width={600}
          height={400}
          className="rounded-xl w-full h-auto shadow"
        />
      </div>
    </div>
  )
}
