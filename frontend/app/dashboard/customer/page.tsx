"use client";

import React, { useState } from "react";
import Link from "next/link";
import AnimatedMap from "@/components/AnimatedMap";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([
    {
      id: "ORD123",
      status: "Dispatched",
      eta: "25 mins",
      pickup: "Warehouse A",
      destination: "Customer Address 1",
    },
    {
      id: "ORD124",
      status: "Pending",
      eta: "--",
      pickup: "Warehouse B",
      destination: "Customer Address 2",
    },
  ]);

  return (
    <div className="pt-24 px-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Dashboard</h1>

      {/* Place New Order */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Place New Delivery</h2>
        <div className="text-gray-600">(Form Coming Soon)</div>
      </div>

      {/* Current Orders */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                <p className="text-lg font-semibold text-blue-700">
                  {order.status} - ETA: {order.eta}
                </p>
              </div>
              <button className="text-red-500 text-sm hover:underline">
                Cancel Order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Tracking */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Live Tracking</h2>
        <AnimatedMap />
      </div>

      {/* Order History */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <div className="text-gray-600">(Order history coming soon)</div>
      </div>

      {/* Feedback */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>
        <div className="text-gray-600">(Rating & feedback coming soon)</div>
      </div>
    </div>
  );
}