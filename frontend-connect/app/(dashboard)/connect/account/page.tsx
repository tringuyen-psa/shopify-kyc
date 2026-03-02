'use client'

import { useState, useEffect } from 'react'
import { ConnectAccountManagement } from "@stripe/react-connect-js"
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'
import { EmbeddedComponentWrapper } from '@/app/components/EmbeddedComponentWrapper'

export default function ConnectAccountPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!accountManager.hasAccount()) {
      router.push('/select-account')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Account Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your business details and account settings.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Connected Account</h3>
            <p className="text-sm text-gray-600 mt-1">
              Account ID: {accountManager.getAccountId()}
            </p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            accountManager.isDemo()
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {accountManager.isDemo() ? 'Demo Account' : 'Live Account'}
          </div>
        </div>
      </div>

      {/* Account Management Component */}
      <div className="bg-white rounded-lg border border-gray-200">
        <EmbeddedComponentWrapper
          demoOnboarding={true}
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing account management...</p>
              </div>
            </div>
          }
        >
          <div className="p-6">
            <ConnectAccountManagement />
          </div>
        </EmbeddedComponentWrapper>
      </div>
    </div>
  )
}
