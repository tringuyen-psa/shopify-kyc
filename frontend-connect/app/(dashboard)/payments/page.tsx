'use client';

import * as React from 'react';
import {ConnectPayments} from '@stripe/react-connect-js';
import Container from '@/app/components/Container';
import EmbeddedComponentContainer from '@/app/components/EmbeddedComponentContainer';
import MonthToDateWidget from '@/app/components/MonthToDateWidget';
import CustomersWidget from '@/app/components/CustomersWidget';
import Button from '@/components/ui/Button';
import {LoaderCircle, Plus} from 'lucide-react';
import {accountManager} from '@/lib/stripe-account';
import {useRouter} from 'next/navigation';
import {EmbeddedComponentWrapper} from '@/app/components/EmbeddedComponentWrapper';
import CreatePaymentsButton from '@/app/components/CreatePaymentsButton';
import {useQuery} from '@tanstack/react-query';
import {AuthBypass} from '@/components/AuthBypass';

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
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>

    <div className="flex gap-6">
      <div className="flex-1 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="flex-1 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>

    <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
  </div>
);

export default function PaymentsPage() {
  const router = useRouter();

  // Query for account status
  const {
    data: accountStatus,
    isLoading: isCheckingAccount,
    error: accountError,
    isError: isAccountError,
  } = useQuery({
    queryKey: ['accountStatus', 'payments'],
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
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
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
    <AuthBypass
      fallback={
        <EmbeddedComponentWrapper demoOnboarding={true}>
          <PageSkeleton />
        </EmbeddedComponentWrapper>
      }
    >
      <EmbeddedComponentWrapper demoOnboarding={true}>
        <>
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-3xl font-bold">Payments</h1>
            <div className="flex gap-2">
              <CreatePaymentsButton />
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Payment
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-5 lg:flex-row">
            <div className="flex-1">
              <MonthToDateWidget />
            </div>
            <div className="flex-1">
              <CustomersWidget />
            </div>
          </div>

          <Container>
            <div className="flex flex-row items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Recent payments</h1>
              <div className="flex items-center gap-4">
                {accountStatus.isDemo && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                    ⚡ Demo Account
                  </div>
                )}
                {/* Account status indicator */}
                <div className="text-sm text-gray-500">
                  {accountStatus.accountId && `Account: ${accountStatus.accountId.slice(-8)}`}
                </div>
              </div>
            </div>
            <EmbeddedComponentContainer componentName="Payments">
              <ConnectPayments />
            </EmbeddedComponentContainer>
          </Container>
        </>
      </EmbeddedComponentWrapper>
    </AuthBypass>
  );
}