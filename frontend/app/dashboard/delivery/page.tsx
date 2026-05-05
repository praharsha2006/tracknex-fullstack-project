'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface CurrentTrip {
  _id?: string
  orderId?: string
  status?: string
}

export default function DeliveryDashboard() {
  const [trip, setTrip] = useState<CurrentTrip | null>(null)
  const [error, setError] = useState('')
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    const fetchCurrentTrip = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found in localStorage')

        const res = await axios.get(`${apiBaseUrl}/api/delivery/current-trip`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setTrip(res.data)
        setError('')
      } catch (err: unknown) {
        console.error(err)
        setError('Could not load current trip.')
      }
    }

    fetchCurrentTrip()
  }, [apiBaseUrl])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>

      {error && <p className="text-red-600">{error}</p>}

      {trip ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Current Trip</h2>
          <p><strong>Trip ID:</strong> {trip._id}</p>
          <p><strong>Order ID:</strong> {trip.orderId}</p>
          <p><strong>Status:</strong> {trip.status}</p>
        </div>
      ) : (
        !error && <p>Loading trip...</p>
      )}
    </div>
  )
}
