'use client'

import { useEffect, useState } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { useUrlAccountAuth, UrlAccountAuthProvider } from '@/lib/url-account-auth'

interface AuthBypassProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function AuthBypassInner({ children, fallback = null }: AuthBypassProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const { hasUrlAccount, urlAccountId, urlAccountType } = useUrlAccountAuth()

  useEffect(() => {
    const checkAccess = () => {
      try {
        // Check 1: URL Account ID (highest priority)
        if (hasUrlAccount && urlAccountId) {
          accountManager.save(urlAccountId, urlAccountType)
          setHasAccess(true)
          setLoading(false)
          return
        }

        // Check 2: Existing saved account
        if (accountManager.hasAccount()) {
          setHasAccess(true)
          setLoading(false)
          return
        }

        // Check 3: Demo account fallback
        accountManager.save('demo_account_id', 'demo')
        setHasAccess(true)
        setLoading(false)

      } catch (error) {
        console.error('Auth bypass error:', error)
        setHasAccess(false)
        setLoading(false)
      }
    }

    // Small delay to ensure URL params are processed
    const timer = setTimeout(checkAccess, 100)
    return () => clearTimeout(timer)
  }, [hasUrlAccount, urlAccountId, urlAccountType])

  if (loading) {
    return fallback || <div>Loading...</div>
  }

  if (!hasAccess) {
    return fallback || <div>Access denied</div>
  }

  return <>{children}</>
}

export function AuthBypass({ children, fallback = null }: AuthBypassProps) {
  return (
    <>
      <UrlAccountAuthProvider />
      <AuthBypassInner fallback={fallback}>
        {children}
      </AuthBypassInner>
    </>
  )
}