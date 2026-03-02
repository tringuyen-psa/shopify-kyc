'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building, Users, ArrowRight, Loader2 } from 'lucide-react'
import { accountManager } from '@/lib/stripe-account'

export const dynamic = 'force-dynamic'

export default function SelectAccountPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDemoAccount = async () => {
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

      // Save the new account to localStorage
      accountManager.save(data.accountId, 'demo')

      // Redirect to home
      window.location.href = '/home'
    } catch (err: any) {
      console.error('Error creating demo account:', err)
      setError(err.message || 'Failed to create demo account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">F</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Furever</h1>
          </div>
          <p className="text-xl text-gray-600">
            Welcome! Choose how you want to get started
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Access your account without logging into Stripe - use our platform authentication instead
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Login Option */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-100 hover:border-green-300 transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Business Owner</h2>
                <p className="text-gray-600">I&apos;m a business owner managing my account</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Sign in with your business credentials to access your Stripe Connect account.
                No need to log into Stripe directly - we handle everything through our platform.
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Quick and easy setup
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Automatic Stripe account creation
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  No Stripe login required
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Full payment management
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Sign in to Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Existing Account Option */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Demo Account</h2>
                <p className="text-gray-600">Explore the platform with test data</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Try out all features with our demo account. Perfect for exploring the platform
                without setting up payments.
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  No setup required
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Test with sample data
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  All features enabled
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  No Stripe login required
                </li>
              </ul>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleDemoAccount}
                disabled={loading}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Demo Account...
                  </>
                ) : (
                  <>
                    Try Demo Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-block">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🔐 Enhanced Security & Convenience
            </h3>
            <p className="text-yellow-700 text-sm max-w-2xl">
              Our platform uses Stripe Connect with authentication bypass, meaning you never need to log into Stripe directly.
              All account management, payments, and payouts happen securely through our interface.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by Stripe Connect • Secure payment processing • No Stripe login required
          </p>
          <p className="mt-2">
            Questions? Contact support@furever.com
          </p>
        </div>
      </div>
    </div>
  )
}