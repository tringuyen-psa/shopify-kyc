'use client';

import * as React from 'react';
import {
    ConnectAccountManagement,
    ConnectNotificationBanner,
    ConnectPaymentMethodSettings,
    ConnectPaymentDisputes
} from '@stripe/react-connect-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Container from '@/app/components/Container';
import EmbeddedComponentContainer from '@/app/components/EmbeddedComponentContainer';
import Link from '@/components/ui/link';
import EditPasswordButton from '@/app/components/EditPasswordButton';
import EditEmailButton from '@/app/components/EditEmailButton';
import { EmbeddedComponentWrapper } from '@/app/components/EmbeddedComponentWrapper';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import Button from '@/components/ui/Button';
import { accountManager } from '@/lib/stripe-account';

const fetchAccountInfo = async () => {
    const accountId = accountManager.getAccountId();

    if (!accountId) {
        throw new Error('No account found');
    }

    const res = await fetch('/api/account_info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-stripe-account': accountId,
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch account info: ${res.status} - ${errorText}`);
    }

    return res.json();
};

// Skeleton loader for account details
const AccountDetailsSkeleton = () => (
    <div className="space-y-4 lg:flex-row lg:gap-20">
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
    </div>
);

// Account details component
const AccountDetails = React.memo(({ accountData, showPassword, setShowPassword }: {
    accountData: any;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
}) => {
    const businessName = accountData?.businessName || 'Furever Pet Services';
    const password = accountData?.password || '';
    const changedPassword = accountData?.changedPassword || false;
    const email = accountData?.email || 'contact@furever.com';
    const canShowPassword = password && !changedPassword;

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-20">
            <div>
                <div className="text-gray-600">Business name</div>
                <div className="font-medium">{businessName}</div>
            </div>
            <div>
                <div className="text-gray-600">Email</div>
                <div className="font-medium">{email}</div>
            </div>
            <div>
                <div className="text-gray-600">Password</div>
                <div className="font-medium">
                    {showPassword && canShowPassword ? password : '••••••••'}
                </div>
                {canShowPassword && (
                    <Link
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                        }}
                    >
                        {' '}
                        {showPassword ? 'Hide password' : 'Show password'}
                    </Link>
                )}
            </div>
        </div>
    );
});

AccountDetails.displayName = 'AccountDetails';

export default function AccountPage() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showBanner, setShowBanner] = React.useState(false);
    const queryClient = useQueryClient();

    const {
        data: accountData,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['accountInfo'],
        queryFn: fetchAccountInfo,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const renderConditionallyCallback = (response: {
        total: number;
        actionRequired: number;
    }) => {
        if (response && response.total > 0) {
            setShowBanner(true);
        } else {
            setShowBanner(false);
        }
    };

    // Handle retry
    const handleRetry = () => {
        refetch();
    };

    return (
        <EmbeddedComponentWrapper demoOnboarding={true}>
            <ErrorBoundary>
                {/* Banner component */}
                {showBanner && (
                    <div className={`${showBanner ? 'flex' : 'hidden'} flex-col`}>
                        <EmbeddedComponentContainer
                            componentName="NotificationBanner"
                            className="overflow-hidden rounded-lg px-0 py-0 pb-1"
                        >
                            <ConnectNotificationBanner
                                onNotificationsChange={renderConditionallyCallback}
                            />
                        </EmbeddedComponentContainer>
                    </div>
                )}

                {/* Details Section */}
                <Container>
                    <div className="flex flex-row items-center justify-between">
                        <header className="mb-5">
                            <h1 className="text-xl font-semibold">Details</h1>
                            <h2 className="text-gray-600">Manage your account information.</h2>
                        </header>
                        <div className="flex gap-2">
                            <EditEmailButton />
                            <EditPasswordButton />
                        </div>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex items-center gap-2 py-8">
                            <LoaderCircle className="animate-spin" size={16} />
                            <span className="text-sm text-gray-600">
                                {isRefetching ? 'Refreshing...' : 'Loading account information...'}
                            </span>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="text-sm text-red-600 mb-2">
                                {error.message || 'Failed to load account information'}
                            </div>
                            <div className="text-xs text-gray-500 mb-4">
                                Please check your account settings or try again.
                            </div>
                            <Button
                                onClick={handleRetry}
                                disabled={isRefetching}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                                {isRefetching ? 'Retrying...' : 'Retry'}
                            </Button>
                        </div>
                    )}

                    {/* Success state */}
                    {!isLoading && !error && accountData && (
                        <ErrorBoundary
                            fallback={
                                <div className="text-center py-4">
                                    <div className="text-sm text-red-600 mb-2">
                                        Error displaying account details
                                    </div>
                                    <Button
                                        onClick={() => queryClient.invalidateQueries({ queryKey: ['accountInfo'] })}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Reload
                                    </Button>
                                </div>
                            }
                        >
                            <AccountDetails
                                accountData={accountData}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                        </ErrorBoundary>
                    )}
                </Container>

                {/* Account Settings Section */}
                <Container>
                    <header className="mb-5">
                        <h1 className="text-xl font-semibold">Account settings</h1>
                        <h2 className="text-gray-600">Manage account and business settings.</h2>
                    </header>
                    <div className="flex flex-col space-y-4">
                        <ErrorBoundary
                            fallback={
                                <div className="text-center py-8">
                                    <div className="text-sm text-red-600 mb-2">
                                        Error loading account management
                                    </div>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            }
                        >
                            <EmbeddedComponentContainer componentName="AccountManagement">
                                <ConnectAccountManagement />
                            </EmbeddedComponentContainer>
                        </ErrorBoundary>
                    </div>
                </Container>

                {/* Payment Methods Section */}
                <Container>
                    <header className="mb-5">
                        <h1 className="text-xl font-semibold">Payment methods</h1>
                        <h2 className="text-gray-600">Add and manage your payment methods.</h2>
                    </header>
                    <EmbeddedComponentContainer componentName="PaymentMethodSettings">
                        <ConnectPaymentMethodSettings />
                    </EmbeddedComponentContainer>
                </Container>
            </ErrorBoundary>
        </EmbeddedComponentWrapper>
    );
}