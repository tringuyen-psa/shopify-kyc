'use client';

import {ConnectPayouts} from '@stripe/react-connect-js';
import Container from '@/app/components/Container';
import EmbeddedComponentContainer from '@/app/components/EmbeddedComponentContainer';
import {LoaderCircle} from 'lucide-react';
import React from 'react';
import {accountManager} from '@/lib/stripe-account';
import {useRouter} from 'next/navigation';
import {EmbeddedComponentWrapper} from '@/app/components/EmbeddedComponentWrapper';
import {useQuery} from '@tanstack/react-query';
import Badge from '@/components/ui/Badge';

const fetchAccountStatus = async () => {
  const hasAccount = accountManager.hasAccount();
  if (!hasAccount) {
    throw new Error('No account found');
  }

  return {
    hasAccount: true,
    isDemo: accountManager.isDemo(),
    accountId: accountManager.getAccountId(),
  };
};

// Skeleton loader for better UX
const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>

    <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
  </div>
);

export default function PayoutsPage() {
  const router = useRouter();

  // Query for account status
  const {
    data: accountStatus,
    isLoading: isCheckingAccount,
    error: accountError,
    isError: isAccountError,
  } = useQuery({
    queryKey: ['accountStatus', 'payouts'],
    queryFn: fetchAccountStatus,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Redirect if no account
  React.useEffect(() => {
    if (accountStatus && !accountStatus.hasAccount) {
      router.push('/select-account');
    }
  }, [accountStatus, router]);

  // Handle account error
  React.useEffect(() => {
    if (isAccountError) {
      console.error('Account error:', accountError);
      router.push('/select-account');
    }
  }, [isAccountError, accountError, router]);

  // Show skeleton while checking account
  if (isCheckingAccount) {
    return (
      <EmbeddedComponentWrapper demoOnboarding={true}>
        <PageSkeleton />
      </EmbeddedComponentWrapper>
    );
  }

  // Show error state
  if (isAccountError) {
    return (
      <EmbeddedComponentWrapper demoOnboarding={true}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading account information</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </EmbeddedComponentWrapper>
    );
  }

  // Show loading if no account status yet
  if (!accountStatus) {
    return (
      <EmbeddedComponentWrapper demoOnboarding={true}>
        <PageSkeleton />
      </EmbeddedComponentWrapper>
    );
  }

  return (
    <EmbeddedComponentWrapper demoOnboarding={true}>
      <>
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-3xl font-bold">Payouts</h1>
          <div className="flex items-center gap-4">
            {accountStatus.isDemo && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                ⚡ Demo Account
              </Badge>
            )}
            {/* Account status indicator */}
            <div className="text-sm text-gray-500">
              {accountStatus.accountId && `Account: ${accountStatus.accountId.slice(-8)}`}
            </div>
          </div>
        </div>

        <Container>
          <EmbeddedComponentContainer componentName="Payouts">
            <ConnectPayouts />
          </EmbeddedComponentContainer>
        </Container>
      </>
    </EmbeddedComponentWrapper>
  );
}