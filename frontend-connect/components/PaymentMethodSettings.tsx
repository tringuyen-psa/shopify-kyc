'use client';

import { useEffect, useState } from 'react';
import { accountManager } from '@/lib/stripe-account';

interface PaymentMethodSettingsProps {
  className?: string;
}

const PaymentMethodSettings: React.FC<PaymentMethodSettingsProps> = ({ className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePaymentMethodSettings = async () => {
      try {
        const accountId = accountManager.getAccountId();

        if (!accountId) {
          setError('No account found');
          return;
        }

        // Fetch client secret for the session
        const response = await fetch('/api/account/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Stripe-Account': accountId,
          },
          body: JSON.stringify({
            accountId,
            accountType: accountManager.getType() || 'custom',
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`);
        }

        const { client_secret } = await response.json();

        if (!client_secret) {
          throw new Error('No client secret received');
        }

        // PaymentMethodSettings will be loaded via EmbeddedComponentContainer
        // The actual Stripe Connect component will be mounted by the parent container

        setIsLoaded(true);

      } catch (err: any) {
        console.error('Error loading PaymentMethodSettings:', err);
        setError(err.message || 'Failed to load payment method settings');
      }
    };

    initializePaymentMethodSettings();
  }, []);

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Method Settings Unavailable</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <div className="text-xs text-gray-400">
          Please ensure your account is properly configured for payment method management.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payment method settings...</p>
        </div>
      </div>
    );
  }

  return null; // Component is mounted directly by Stripe Connect
};

export default PaymentMethodSettings;