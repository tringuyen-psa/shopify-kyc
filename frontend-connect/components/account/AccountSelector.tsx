'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import DemoAccountCard from './DemoAccountCard'
import CreateAccountCard from './CreateAccountCard'
import { accountManager } from '@/lib/stripe-account'

export default function AccountSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSelectDemo = async () => {
    setLoading(true)
    try {
      // Verify demo account exists
      const response = await fetch('/api/account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'demo' }),
      })

      if (!response.ok) throw new Error('Failed to verify demo account')

      const data = await response.json()

      // Save demo account
      accountManager.save(data.accountId, 'demo')

      // Redirect to dashboard
      router.push('/home')
    } catch (error) {
      alert('Failed to setup demo account')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = async (email: string, businessName: string) => {
    setLoading(true)
    try {
      // Create new account
      const response = await fetch('/api/account/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, businessName }),
      })

      if (!response.ok) throw new Error('Failed to create account')

      const data = await response.json()

      // Save live account
      accountManager.save(data.accountId, 'live')

      // Redirect to onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        router.push('/home')
      }
    } catch (error) {
      alert('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <DemoAccountCard
        onSelect={handleSelectDemo}
        loading={loading}
      />
      <CreateAccountCard
        onCreate={handleCreateNew}
        loading={loading}
      />
    </div>
  )
}