'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { accountManager } from '@/lib/stripe-account'

function UrlAccountAuthInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const accountId = searchParams.get('accountId')
    const accountType = searchParams.get('accountType') as 'demo' | 'live' | 'express' | 'custom' || 'demo'

    if (accountId) {
      // Auto-login với Account ID từ URL
      accountManager.save(accountId, accountType)

      // Clean URL params để không hiển thị sensitive info
      const url = new URL(window.location.href)
      url.searchParams.delete('accountId')
      url.searchParams.delete('accountType')

      // Redirect đến clean URL
      router.replace(url.pathname + url.search)
    }
  }, [searchParams, router])

  return null
}

export function useUrlAccountAuth() {
  // Extract params on client side only
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      hasUrlAccount: !!urlParams.get('accountId'),
      urlAccountId: urlParams.get('accountId'),
      urlAccountType: urlParams.get('accountType') as 'demo' | 'live' | 'express' | 'custom' || 'demo'
    }
  }

  return {
    hasUrlAccount: false,
    urlAccountId: null,
    urlAccountType: 'demo'
  }
}

export function UrlAccountAuthProvider() {
  return (
    <Suspense fallback={null}>
      <UrlAccountAuthInner />
    </Suspense>
  )
}