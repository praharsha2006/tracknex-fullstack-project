'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { name: 'Home', path: '/dashboard/manager' },
  { name: 'Orders', path: '/dashboard/manager/orders' },
  { name: 'Trips', path: '/dashboard/manager/trips' },
  { name: 'Analytics', path: '/dashboard/manager/analytics' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50 px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" alt="TrackNex Logo" width={44} height={44} />
        <span className="text-2xl font-extrabold tracking-tight text-gray-900">TrackNex</span>
      </Link>

      {/* Nav Links */}
      <div className="flex space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`text-sm font-medium ${
              pathname === item.path
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="ml-6 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </nav>
  )
}
