'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is TrackNex and how does it work?',
    answer:
      'TrackNex is a delivery tracking and optimization platform that enables businesses to manage fleets, optimize routes, and track deliveries in real-time.',
  },
  {
    question: 'Is TrackNex suitable for small businesses?',
    answer:
      'Absolutely. TrackNex is scalable and designed to support both small delivery teams and large-scale operations.',
  },
  {
    question: 'Can I integrate TrackNex with my existing systems?',
    answer:
      'Yes. TrackNex offers APIs and integration support to connect with your existing order management or ERP systems.',
  },
  {
    question: 'Is there a mobile app for drivers?',
    answer:
      'Yes. TrackNex offers a dedicated mobile app for delivery personnel, enabling them to receive route instructions, collect proof of delivery, and update delivery statuses in real-time.',
  },
  {
    question: 'How secure is my data with TrackNex?',
    answer:
      'We use industry-standard encryption, secure cloud hosting, and comply with data protection regulations to ensure your information is safe.',
  },
]

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index)
  }

  return (
    <section id="faq" className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
            FAQ
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Answers to the most common questions about TrackNex, features, integration and more.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
            >
              <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => toggle(idx)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    activeIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeIndex === idx && (
                <p className="mt-4 text-sm text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
