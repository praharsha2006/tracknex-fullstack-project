'use client'

import FeatureCard from './FeatureCard'

const features = [
  {
    title: 'Route Planning',
    description:
      'Create optimized delivery schedules based on priority, distance, and traffic insights to maximize efficiency.',
    image: '/route-planning.png',
  },
  {
    title: 'Route Optimization',
    description:
      'Leverage AI-based route optimization to reduce delivery time and operational cost.',
    image: '/route-optimisation.png',
  },
  {
    title: 'Live Tracking',
    description:
      'Track all deliveries in real-time with GPS-based location updates.',
    image: '/delivery-tracking.png',
  },
  {
    title: 'Proof of Delivery',
    description:
      'Capture e-signatures, photos, and notes as delivery confirmation.',
    image: '/proof-delivery.png',
  },
//   {
//     title: 'Notifications & Feedback',
//     description:
//       'Send automated SMS or email alerts and gather instant customer feedback post delivery.',
//     image: '/notifications.png',
//   },
//   {
//     title: 'Analytics & Performance',
//     description:
//       'Get detailed reports, KPIs and delivery metrics to improve operational efficiency.',
//     image: '/analytics.png',
//   },
]

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
            Key Features
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose TrackNex?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built for businesses that care about real-time visibility, delivery performance, and customer experience — all in one platform.
          </p>
        </div>

        {/* Feature Cards */}
        {features.map((feature, idx) => (
          <FeatureCard
            key={idx}
            title={feature.title}
            description={feature.description}
            image={feature.image}
            reverse={idx % 2 === 1}
          />
        ))}
      </div>
    </section>
  )
}
