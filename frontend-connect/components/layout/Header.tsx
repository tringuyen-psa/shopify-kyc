'use client'

import { accountManager } from '@/lib/stripe-account'

export default function Header() {
  const accountType = accountManager.getType()

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your {accountType === 'demo' ? 'demo' : 'live'} account today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            accountType === 'demo'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {accountType === 'demo' ? '⚡ Demo Mode' : '✓ Live Account'}
          </div>
        </div>
      </div>
    </header>
  )
}