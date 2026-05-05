'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  id: string
  username: string
  role: string
  iat: number
  exp: number
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('manager')
  const [username, setUsername] = useState('')
  const router = useRouter()
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${apiBaseUrl}/api/auth/login`, {
        username,
        password,
        role,
      })

      const token = res.data.token

      // ✅ Decode JWT to extract role
      const decoded: DecodedToken = jwtDecode(token)
      const userRole = decoded.role

      localStorage.setItem('token', token)
      localStorage.setItem('role', userRole)

      // ✅ Redirect based on role
      if (userRole === 'manager') router.push('/dashboard/manager')
      else if (userRole === 'delivery') router.push('/dashboard/delivery')
      else router.push('/dashboard/customer')
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : null
      alert(message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="TrackNex Logo"
            width={64}
            height={64}
            className="mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">Login to TrackNex</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="manager">Manager</option>
              <option value="delivery">Delivery</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-black">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
}
