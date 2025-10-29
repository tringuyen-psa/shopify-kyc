'use client'

interface Props {
  onSelect: () => void
  loading: boolean
}

export default function DemoAccountCard({ onSelect, loading }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-green-500 transition-all p-8">
      {/* Icon */}
      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Content */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-2xl font-bold text-gray-900">Demo Account</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
            RECOMMENDED
          </span>
        </div>

        <p className="text-gray-600 mb-6">
          Start immediately with a pre-configured test account. Perfect for exploring features.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Instant access - no setup required</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Pre-loaded with sample data</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Test mode only - safe to experiment</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">View all Stripe Connect features</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onSelect}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Setting up...' : 'Use Demo Account →'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Uses pre-configured demo account
      </p>
    </div>
  )
}