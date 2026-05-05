'use client'

import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TrackNex Dashboard</h1>
        <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">Go to Home</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
