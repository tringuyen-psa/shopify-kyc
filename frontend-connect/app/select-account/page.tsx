'use client'

import { useState, useEffect } from 'react'
import { Building, ArrowRight, Loader2, Plus } from 'lucide-react'
import { accountManager } from '@/lib/stripe-account'

export const dynamic = 'force-dynamic'

interface DemoAccount {
  accountId: string
  createdAt: string
  email: string
  businessName: string
}

export default function SelectAccountPage() {
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/demo-account/create')
      const data = await response.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleSelectAccount = (accountId: string) => {
    accountManager.save(accountId, 'demo')
    window.location.href = '/home'
  }

  const handleCreateAccount = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo-account/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create demo account')
      }

      accountManager.save(data.accountId, 'demo')
      window.location.href = '/home'
    } catch (err: any) {
      console.error('Error creating demo account:', err)
      setError(err.message || 'Failed to create demo account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">F</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Furever</h1>
          </div>
          <p className="text-xl text-gray-600">
            Select an account to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <button
                  key={account.accountId}
                  onClick={() => handleSelectAccount(account.accountId)}
                  className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{account.businessName}</p>
                    <p className="text-sm text-gray-500">{account.email}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}

              {accounts.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No accounts found. Create one to get started.
                </p>
              )}

              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-blue-600 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Account
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by Stripe Connect • Secure payment processing
          </p>
        </div>
      </div>
    </div>
  )
}
