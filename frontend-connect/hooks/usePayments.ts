'use client'

import { useState, useEffect } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { Payment } from '@/types/payment'

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountManager.hasAccount()) {
      setLoading(false)
      return
    }

    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      const accountId = accountManager.getAccountId()

      if (!accountId) {
        throw new Error('No account ID found')
      }

      const response = await fetch('/api/stripe/payments', {
        headers: {
          'x-stripe-account': accountId,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching payments:', err)

      // Set sample data for demo purposes
      if (accountManager.isDemo()) {
        setPayments([
          {
            id: 'ch_demo_1',
            amount: 100.00,
            currency: 'USD',
            status: 'succeeded',
            from: 'john.doe@example.com',
            date: 'Oct 28, 2024 at 2:30 PM'
          },
          {
            id: 'ch_demo_2',
            amount: 250.50,
            currency: 'USD',
            status: 'succeeded',
            from: 'jane.smith@example.com',
            date: 'Oct 28, 2024 at 1:15 PM'
          },
          {
            id: 'ch_demo_3',
            amount: 75.00,
            currency: 'USD',
            status: 'refunded',
            from: 'bob.wilson@example.com',
            date: 'Oct 28, 2024 at 11:45 AM'
          },
          {
            id: 'ch_demo_4',
            amount: 500.00,
            currency: 'USD',
            status: 'disputed',
            from: 'alice.brown@example.com',
            date: 'Oct 28, 2024 at 10:30 AM'
          },
          {
            id: 'ch_demo_5',
            amount: 125.75,
            currency: 'USD',
            status: 'succeeded',
            from: 'charlie.davis@example.com',
            date: 'Oct 27, 2024 at 9:15 PM'
          }
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshPayments = () => {
    fetchPayments()
  }

  const getTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getSuccessfulPayments = () => {
    return payments.filter(p => p.status === 'succeeded')
  }

  const getRefundedPayments = () => {
    return payments.filter(p => p.status === 'refunded')
  }

  const getDisputedPayments = () => {
    return payments.filter(p => p.status === 'disputed')
  }

  return {
    payments,
    loading,
    error,
    refreshPayments,
    getTotalRevenue,
    getSuccessfulPayments,
    getRefundedPayments,
    getDisputedPayments,
  }
}