'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import DashboardMap from '@/components/DashboardMap';
import AnimatedMap from '@/components/AnimatedMap';


interface Order {
  _id?: string
  customerName?: string
  deliveryAddress?: string
  pickupAddress?: string
  status: string
}

export default function ManagerDashboardHome() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/orders`, { timeout: 10000 })
      setOrders(res.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load dashboard data. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const total = orders.length
  const pending = orders.filter((o) => o.status === 'Pending').length
  const completed = orders.filter((o) => o.status === 'Delivered').length

  return (
    <div className="pt-24 px-6 min-h-screen bg-gray-100">
      {loading ? (
        <p className="text-center text-gray-500 pt-32">Loading dashboard...</p>
      ) : (
        <>
          {error ? (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manager Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-blue-700">{total}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-500">Pending Deliveries</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-500">Completed Deliveries</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-500">Avg. ETA</p>
              <p className="text-2xl font-bold text-indigo-600">N/A</p>
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/dashboard/manager/orders">
              <div className="cursor-pointer text-center bg-white hover:bg-blue-50 border border-blue-500 text-blue-600 p-4 rounded-xl shadow font-medium">
                📦 Manage Orders
              </div>
            </Link>
            <Link href="/dashboard/manager/trips">
              <div className="cursor-pointer text-center bg-white hover:bg-green-50 border border-green-500 text-green-600 p-4 rounded-xl shadow font-medium">
                🚚 View Trips
              </div>
            </Link>
            <Link href="/dashboard/manager/analytics">
              <div className="cursor-pointer text-center bg-white hover:bg-purple-50 border border-purple-500 text-purple-600 p-4 rounded-xl shadow font-medium">
                📈 Analytics
              </div>
            </Link>
          </div>

          {/* Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow text-gray-600">
            📊 More insights and real-time visualizations will appear here...
          </div>
          <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Live Delivery Map</h2>
          {/* <DashboardMap /> */}
          <AnimatedMap />
          
        </div>
        </>
      )}
    </div>
  )
}
