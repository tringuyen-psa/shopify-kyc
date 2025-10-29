'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'refunded' | 'disputed'
  from: string
  date: string
}

interface Props {
  payments: Payment[]
}

export default function PaymentTable({ payments }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'disputes'>('all')

  const filteredPayments = activeTab === 'disputes'
    ? payments.filter(p => p.status === 'disputed')
    : payments

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent payments</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Export
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'disputes'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Disputes
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="pb-3 text-sm font-medium text-gray-600 pl-4">Status</th>
                <th className="pb-3 text-sm font-medium text-gray-600 pl-4">From</th>
                <th className="pb-3 text-sm font-medium text-gray-600 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {payment.currency}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-4 pl-4 text-gray-700">
                    {payment.from}
                  </td>
                  <td className="py-4 text-right text-gray-600 text-sm">
                    {payment.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Viewing 1-10 of {filteredPayments.length} results
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}