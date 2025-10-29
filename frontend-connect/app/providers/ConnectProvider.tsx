'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useConnect } from '@/app/hooks/useConnect'
import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'

interface ConnectProviderProps {
  children: ReactNode
}

export default function ConnectProvider({ children }: ConnectProviderProps) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasError, stripeConnectInstance } = useConnect()

  useEffect(() => {
    // Check if account exists
    if (!accountManager.hasAccount()) {
      router.push('/select-account')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (hasError || !stripeConnectInstance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load Stripe Connect</h3>
          <p className="text-gray-600">
            Unable to initialize Stripe Connect components.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  )
}