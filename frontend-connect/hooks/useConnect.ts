'use client';

import { useState, useEffect } from 'react';
import { accountManager } from '@/lib/stripe-account';

interface UseConnectResult {
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  accountId: string | null;
  accountType: string | null;
  refetch: () => Promise<void>;
}

export function useConnect(): UseConnectResult {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);

  const fetchClientSecret = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentAccountId = accountManager.getAccountId();
      const currentAccountType = accountManager.getType();

      if (!currentAccountId) {
        setError('No account found');
        return;
      }

      setAccountId(currentAccountId);
      setAccountType(currentAccountType);

      console.log('useConnect - Fetching client secret for account:', currentAccountId);

      const response = await fetch('/api/account/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Account': currentAccountId,
        },
        body: JSON.stringify({
          accountId: currentAccountId,
          accountType: currentAccountType || 'custom',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('useConnect - Client secret received:', data.client_secret ? 'Yes' : 'No');
        setClientSecret(data.client_secret);
      } else {
        const errorText = await response.text();
        console.error('useConnect - Failed to fetch client secret:', response.status, errorText);
        setError(`Failed to fetch client secret: ${response.status}`);
      }
    } catch (err: any) {
      console.error('useConnect - Error fetching client secret:', err);
      setError(err.message || 'Failed to fetch client secret');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSecret();
  }, []);

  const refetch = async () => {
    await fetchClientSecret();
  };

  return {
    clientSecret,
    loading,
    error,
    accountId,
    accountType,
    refetch,
  };
}