'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
import EmbeddedComponentContainer from '@/app/components/EmbeddedComponentContainer';
import { accountManager } from '@/lib/stripe-account';

const OnboardingPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get account details from URL params or saved account
  const accountId = searchParams?.get('accountId') || accountManager.getAccountId();
  const accountType = (searchParams?.get('accountType') || accountManager.getType() || 'custom') as 'demo' | 'live' | 'express' | 'custom';

  useEffect(() => {
    if (!accountId) {
      setError('No account found. Please start over.');
      setIsLoading(false);
      return;
    }

    const fetchClientSecret = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/account/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Stripe-Account': accountId,
          },
          body: JSON.stringify({
            accountId,
            accountType,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          throw new Error('No client secret received');
        }
      } catch (err) {
        console.error('Error fetching client secret:', err);
        setError('Failed to load onboarding. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientSecret();
  }, [accountId, accountType]);

  const handleOnboardingComplete = () => {
    setIsComplete(true);
    // Save account details
    accountManager.save(accountId!, accountType);

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/home');
    }, 2000);
  };

  if (isLoading) {
    return (
      <EmbeddedComponentContainer componentName="onboarding">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading onboarding...</p>
          </div>
        </div>
      </EmbeddedComponentContainer>
    );
  }

  if (error) {
    return (
      <EmbeddedComponentContainer componentName="onboarding">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Onboarding Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </EmbeddedComponentContainer>
    );
  }

  if (isComplete) {
    return (
      <EmbeddedComponentContainer componentName="onboarding">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Onboarding Complete!</h2>
            <p className="text-gray-600 mb-4">Your account is ready. Redirecting to dashboard...</p>
            <div className="animate-pulse text-blue-600">
              Setting up your dashboard...
            </div>
          </div>
        </div>
      </EmbeddedComponentContainer>
    );
  }

  return (
    <EmbeddedComponentContainer componentName="onboarding">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Complete Your Account Setup</h1>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  Step 1 of 2
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Business Information</h2>
            <p className="text-gray-600 mb-6">
              Please complete your business information to start accepting payments.
              This secure form is provided by Stripe.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Security Notice:</strong> This is a secure Stripe onboarding process.
                    Your information is encrypted and protected.
                  </p>
                </div>
              </div>
            </div>

            {clientSecret && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Account ID:</span>
                      <p className="font-mono text-gray-900">{accountId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Type:</span>
                      <p className="font-medium text-gray-900 capitalize">{accountType}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <EmbeddedComponentContainer componentName="AccountOnboarding">
                    {clientSecret ? (
                      <div className="min-h-[400px] bg-white border rounded-lg">
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center">
                            <LoaderCircle className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading onboarding...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="text-red-600 mb-4">Failed to load onboarding</div>
                          <button
                            onClick={() => window.location.reload()}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    )}
                  </EmbeddedComponentContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EmbeddedComponentContainer>
  );
};

const OnboardingPageWrapper = () => {
  return (
    <Suspense fallback={
      <EmbeddedComponentContainer componentName="onboarding">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EmbeddedComponentContainer>
    }>
      <OnboardingPage />
    </Suspense>
  );
};

export default OnboardingPageWrapper;