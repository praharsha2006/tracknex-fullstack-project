import React from 'react'
import Navbar from './components/Navbar'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className='bg-gray-100'>{children}</main>
    </div>
  )
}
