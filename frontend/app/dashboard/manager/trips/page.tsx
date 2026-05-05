'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Trip {
  id: number
  _id?: string
  tripId: string
  status: string
  driverId?: {
    id: number
    name?: string
    username?: string
  } | null
  orderIds?: Array<{ id: number }>
}

interface Agent {
  id: number
  _id?: string
  name: string
  username?: string
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const getToken = () => localStorage.getItem('token')

  const getAuthHeaders = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchTrips = async () => {
    const res = await axios.get(`${apiBaseUrl}/api/trips`, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    setTrips(Array.isArray(res.data) ? res.data : [])
  }

  const fetchAgents = async () => {
    const res = await axios.get(`${apiBaseUrl}/api/users/delivery`, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    setAgents(Array.isArray(res.data) ? res.data : [])
  }

  const assignTrip = async (tripId: string, agentId: string) => {
    await axios.post(`${apiBaseUrl}/api/delivery/assign/trip`, {
      tripId: Number(tripId),
      deliveryUserId: Number(agentId)
    }, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    fetchTrips()
  }

  const cancelTrip = async (tripId: string) => {
    await axios.put(`${apiBaseUrl}/api/trips/${tripId}`, {
      status: 'cancelled'
    }, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    fetchTrips()
  }

  const startTrip = async (tripId: string) => {
    await axios.post(`${apiBaseUrl}/api/trips/${tripId}/start`, {}, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    fetchTrips()
  }

  const endTrip = async (tripId: string) => {
    await axios.post(`${apiBaseUrl}/api/trips/${tripId}/end`, {}, {
      headers: getAuthHeaders(),
      timeout: 10000
    })
    fetchTrips()
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setError('Please login again to view trips.')
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        await Promise.all([fetchTrips(), fetchAgents()])
      } catch (err: any) {
        console.error('Trips page load error:', err)
        if (err?.response?.status === 401) {
          setError('Session expired. Please login again.')
        } else if (err?.response?.status === 403) {
          setError('Only managers can view this page.')
        } else {
          setError('Failed to load trips data.')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="pt-24 px-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Trips</h1>

      {loading ? <p className="text-gray-600 mb-4">Loading trips...</p> : null}
      {error ? <p className="text-red-600 mb-4">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div key={trip._id} className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-600 text-sm">Trip ID: {trip.tripId || trip._id}</p>
            <p className="mt-2 text-gray-800 font-medium">
              Driver: {trip.driverId?.name || trip.driverId?.username || 'Unassigned'}
            </p>
            <p className="text-gray-800">Orders: {trip.orderIds?.length || 0}</p>
            <p className={`mt-1 font-semibold ${trip.status === 'pending' ? 'text-yellow-600' : trip.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
              Status: {trip.status}
            </p>

            {/* Assign dropdown */}
            <div className="mt-4 flex flex-col gap-2">
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                onChange={(e) => {
                  if (e.target.value) assignTrip(String(trip.id), e.target.value)
                }}
                defaultValue=""
              >
                <option value="" disabled>Assign to agent</option>
                {agents.map((agent) => (
                  <option key={agent._id || String(agent.id)} value={String(agent.id)}>
                    {agent.name || agent.username}
                  </option>
                ))}
              </select>

              {trip.status === 'assigned' || trip.status === 'pending' ? (
                <button
                  onClick={() => startTrip(String(trip.id))}
                  className="bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded hover:bg-blue-700 transition"
                >
                  Start Trip
                </button>
              ) : null}

              {trip.status === 'in-progress' ? (
                <button
                  onClick={() => endTrip(String(trip.id))}
                  className="bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded hover:bg-emerald-700 transition"
                >
                  End Trip
                </button>
              ) : null}

              {/* Cancel button */}
              <button
                onClick={() => cancelTrip(String(trip.id))}
                className="bg-red-500 text-white text-sm font-medium px-3 py-2 rounded hover:bg-red-600 transition"
              >
                Cancel Trip
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && trips.length === 0 ? (
        <p className="text-gray-600 mt-4">No trips found.</p>
      ) : null}
    </div>
  )
}
