'use client'

import { useEffect } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'

export default function FinancesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-600 mt-2">
          Complete financial analytics and reporting.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <div className="text-2xl font-bold text-gray-900">$12,450</div>
          <p className="text-green-600 text-sm mt-2">+12% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Transactions</h3>
          <div className="text-2xl font-bold text-gray-900">847</div>
          <p className="text-green-600 text-sm mt-2">+8% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Order Value</h3>
          <div className="text-2xl font-bold text-gray-900">$14.69</div>
          <p className="text-red-600 text-sm mt-2">-3% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Income</h3>
          <div className="text-2xl font-bold text-gray-900">$9,825</div>
          <p className="text-green-600 text-sm mt-2">+15% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Revenue chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Card Payments</span>
              <span className="font-semibold">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Bank Transfer</span>
              <span className="font-semibold">10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Other</span>
              <span className="font-semibold">5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Export PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  )
}