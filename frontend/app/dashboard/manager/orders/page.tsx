'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Order {
  _id: string
  customerName: string
  pickupAddress: string
  deliveryAddress: string
  status: string
  createdAt: string
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customerName, setCustomerName] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/orders`, { timeout: 10000 })
      setOrders(res.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const createOrder = async () => {
    try {
      setLoading(true)
      await axios.post(`${apiBaseUrl}/api/orders`, {
        trackingId: `TRK-${Date.now()}`,
        customerName,
        pickupAddress,
        deliveryAddress,
        pickupCoordinates: { lat: 28.6139, lon: 77.2090 },       // Dummy: Delhi
        deliveryCoordinates: { lat: 28.5355, lon: 77.3910 }      // Dummy: Noida
      }, { timeout: 10000 })
      setCustomerName('')
      setPickupAddress('')
      setDeliveryAddress('')
      fetchOrders()
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <main className="pt-20 px-6">
      <h2 className="text-2xl text-black font-bold mb-4">Orders</h2>

      {/* Create Order Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg text-gray-600 font-semibold mb-2">Create New Order</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Customer Name"
            className="border bg-white text-gray-900 px-4 py-2 rounded w-full"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Pickup Address"
            className="border bg-white text-gray-900 px-4 py-2 rounded w-full"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Delivery Address"
            className="border bg-white text-gray-900 px-4 py-2 rounded w-full"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>
        <button
          onClick={createOrder}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg text-gray-600 font-semibold mb-3">Order List</h3>
        <table className="w-full table-auto text-sm text-left">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Pickup</th>
              <th className="px-4 py-2">Delivery</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="bg-gray-400 border-t">
                <td className="px-4 py-2">{order.customerName}</td>
                <td className="px-4 py-2">{order.pickupAddress}</td>
                <td className="px-4 py-2">{order.deliveryAddress}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
