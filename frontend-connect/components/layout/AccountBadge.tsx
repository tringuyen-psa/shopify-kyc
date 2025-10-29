'use client'

import { useEffect, useState } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'

export default function AccountBadge() {
  const [accountType, setAccountType] = useState<'demo' | 'live' | 'express' | 'custom' | null>(null)
  const router = useRouter()

  useEffect(() => {
    setAccountType(accountManager.getType())
  }, [])

  const handleSwitch = () => {
    if (confirm('Switch account? This will redirect you to account selection.')) {
      accountManager.clear()
      router.push('/select-account')
    }
  }

  if (!accountType) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          accountType === 'demo'
            ? 'bg-blue-100 text-blue-700'
            : accountType === 'express'
            ? 'bg-purple-100 text-purple-700'
            : accountType === 'custom'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {accountType === 'demo' ? '⚡ Demo Mode' :
           accountType === 'express' ? '🚀 Express Account' :
           accountType === 'custom' ? '🏢 Custom Account' : '✓ Live Account'}
        </span>
      </div>

      <button
        onClick={handleSwitch}
        className="w-full text-xs text-gray-600 hover:text-gray-900 text-left"
      >
        Switch account →
      </button>
    </div>
  )
}