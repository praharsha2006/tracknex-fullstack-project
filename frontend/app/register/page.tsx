'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('manager')
  const [username, setUsername] = useState('')
  const router = useRouter()
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${apiBaseUrl}/api/auth/register`, {
        name,
        email,
        username,
        password,
        role,
      })

      const token = res.data.token

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)

      if (role === 'manager') router.push('/dashboard/manager')
      else if (role === 'delivery') router.push('/dashboard/delivery')
      else router.push('/dashboard/customer')
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : null
      alert(message || 'Registration failed')
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
          <h1 className="text-2xl font-bold text-gray-800">Create Your Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white text-black px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

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
            Register
          </button>

          <p className="text-sm text-black text-center mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
