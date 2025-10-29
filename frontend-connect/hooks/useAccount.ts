'use client'

import { useState, useEffect } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { AccountInfo } from '@/types/account'

export function useAccount() {
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountManager.hasAccount()) {
      setLoading(false)
      return
    }

    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    try {
      setLoading(true)
      setError(null)

      const accountId = accountManager.getAccountId()

      if (!accountId) {
        throw new Error('No account ID found')
      }

      const response = await fetch('/api/account/current', {
        headers: {
          'x-stripe-account': accountId,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch account')
      }

      const data = await response.json()
      setAccount(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching account:', err)
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (email: string, businessName?: string) => {
    try {
      setError(null)

      const response = await fetch('/api/account/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, businessName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create account')
      }

      const data = await response.json()

      // Save account to localStorage
      accountManager.save(data.accountId, 'live')

      // Redirect to onboarding if URL provided
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        // Fetch account details
        await fetchAccount()
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const selectDemoAccount = async () => {
    try {
      setError(null)

      const response = await fetch('/api/account/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'demo' }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify demo account')
      }

      const data = await response.json()

      // Save demo account to localStorage
      accountManager.save(data.accountId, 'demo')

      // Fetch account details
      await fetchAccount()

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const switchAccount = () => {
    accountManager.clear()
    setAccount(null)
    window.location.href = '/select-account'
  }

  const refreshAccount = () => {
    fetchAccount()
  }

  return {
    account,
    loading,
    error,
    hasAccount: accountManager.hasAccount(),
    accountType: accountManager.getType(),
    isDemo: accountManager.isDemo(),
    accountId: accountManager.getAccountId(),
    createAccount,
    selectDemoAccount,
    switchAccount,
    refreshAccount,
  }
}