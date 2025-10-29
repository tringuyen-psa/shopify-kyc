'use client'

import { useEffect } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'

export default function PetsPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if account exists
    if (!accountManager.hasAccount()) {
      router.push('/select-account')
      return
    }
  }, [router])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pets Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your pet listings and services.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Pets Dashboard</h3>
          <p className="text-gray-600 mb-6">
            This section will contain pet management features including listings, bookings, and care services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Active Listings</h4>
              <p className="text-3xl font-bold text-green-600">12</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Total Bookings</h4>
              <p className="text-3xl font-bold text-blue-600">48</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Revenue</h4>
              <p className="text-3xl font-bold text-purple-600">$3,240</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}