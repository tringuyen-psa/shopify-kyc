'use client'

import { useState, useEffect } from 'react'
import {
  ConnectPayments,
  ConnectBalances,
  ConnectPayouts,
  ConnectAccountManagement,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/app/hooks/useSettings'
import { EmbeddedComponentWrapper } from '@/app/components/EmbeddedComponentWrapper'

export default function ConnectPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'payments' | 'balances' | 'payouts' | 'account' | 'onboarding'>('payments')
  const router = useRouter()
  const settings = useSettings()
  const { theme, updateSettings, setTheme, setLocale } = settings

  useEffect(() => {
    // Check if account exists
    if (!accountManager.hasAccount()) {
      router.push('/select-account')
      return
    }
    setLoading(false)
  }, [router])

  const tabs = [
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'balances', label: 'Balances', icon: '💰' },
    { id: 'payouts', label: 'Payouts', icon: '🏦' },
    { id: 'account', label: 'Account', icon: '⚙️' },
    { id: 'onboarding', label: 'Onboarding', icon: '📋' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Stripe Connect...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stripe Connect Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Complete embedded dashboard for managing your Stripe Connect account.
          </p>
        </div>

        {/* Settings Controls */}
        <div className="flex gap-4 items-center">
          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Theme:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Locale Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Locale:</label>
            <select
              value={settings.locale}
              onChange={(e) => setLocale(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="en-US">English (US)</option>
              <option value="fr-FR">Français</option>
              <option value="en-GB">English (UK)</option>
              <option value="zh-Hant-HK">中文 (香港)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-600 mt-1">
              Account ID: {accountManager.getAccountId() || 'Demo Mode'}
            </p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            accountManager.isDemo()
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {accountManager.isDemo() ? '🔵 Demo Account' : '🟢 Live Account'}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-1">
                  Please check your Stripe configuration and try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Component Content */}
        <div className="p-6">
          <EmbeddedComponentWrapper
            demoOnboarding={true}
            fallback={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing Stripe Connect components...</p>
                </div>
              </div>
            }
          >
            <div className="min-h-[500px]">
              {activeTab === 'payments' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Management</h3>
                  <ConnectPayments />
                </div>
              )}

              {activeTab === 'balances' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
                  <ConnectBalances />
                </div>
              )}

              {activeTab === 'payouts' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Management</h3>
                  <ConnectPayouts />
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <ConnectAccountManagement />
                </div>
              )}

              {activeTab === 'onboarding' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Onboarding</h3>
                  <ConnectAccountOnboarding
                    onExit={() => {
                      console.log('Onboarding exited');
                      setActiveTab('account');
                    }}
                  />
                </div>
              )}
            </div>
          </EmbeddedComponentWrapper>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Embedded Stripe Connect Components
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                This dashboard uses Stripe Connect embedded components to provide a complete payment management experience:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Payments:</strong> View transactions, manage disputes, process refunds</li>
                <li><strong>Balances:</strong> Monitor account balances and available funds</li>
                <li><strong>Payouts:</strong> Schedule and manage bank transfers</li>
                <li><strong>Account:</strong> Update account details and capabilities</li>
                <li><strong>Onboarding:</strong> Complete account verification process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}