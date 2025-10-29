'use client';

import React from 'react';
import Container from '@/app/components/Container';
import Badge from '@/components/ui/Badge';
import { useSettings } from '@/app/hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { accountManager } from '@/lib/stripe-account';
import { LoaderCircle } from 'lucide-react';

// Mock data for fallback
const mockData = {
    amount: 13300,
    change: 7.5,
    data: [0, 10, 25, 20, 15, 5, 30, 40, 55, 40, 45, 55],
};

const fetchMonthToDateStats = async () => {
    const accountId = accountManager.getAccountId();
    if (!accountId) return null;

    try {
        const response = await fetch('/api/stripe/payments', {
            headers: {
                'x-stripe-account': accountId,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }

        const data = await response.json();

        // Calculate month-to-date stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthToDatePayments = data.payments?.filter((payment: any) => {
            if (!payment.date) return false;
            const paymentDate = new Date(payment.date);
            return paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear &&
                payment.status === 'succeeded';
        }) || [];

        const totalAmount = monthToDatePayments.reduce((sum: number, payment: any) =>
            sum + payment.amount, 0);

        // Calculate growth (mock data for demo)
        const change = 7.5; // In real app, compare with previous month

        return {
            amount: totalAmount || mockData.amount,
            change,
            data: mockData.data,
        };
    } catch (error) {
        console.error('Error fetching month-to-date stats:', error);
        return mockData;
    }
};

// Skeleton loader
const WidgetSkeleton = () => (
    <Container className="w-full px-5">
        <div className="flex flex-row justify-between gap-6">
            <div className="min-w-[110px] space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
            </div>
            <div className="relative w-full">
                <div className="h-[55px] w-full max-w-[250px] bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    </Container>
);

const MonthToDateWidget = React.memo(() => {
    const { primaryColor } = useSettings();

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['paymentsStats', 'monthToDate'],
        queryFn: fetchMonthToDateStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    });

    if (isLoading) {
        return <WidgetSkeleton />;
    }

    if (error) {
        console.error('MonthToDateWidget error:', error);
        // Show mock data on error
        return <MonthToDateWidgetContent data={mockData} primaryColor={primaryColor} />;
    }

    if (!data) {
        return <WidgetSkeleton />;
    }

    return <MonthToDateWidgetContent data={data} primaryColor={primaryColor} />;
});

MonthToDateWidget.displayName = 'MonthToDateWidget';

// Separate component for the actual content
const MonthToDateWidgetContent = ({ data, primaryColor }: { data: any; primaryColor: string }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(data.amount);

    const max = Math.max(...data.data);
    const primaryColorHex = primaryColor || '#10b981';

    return (
        <Container className="w-full px-5">
            <div className="flex flex-row justify-between gap-6">
                <div className="min-w-[110px] space-y-1">
                    <h1 className="font-bold text-gray-600">Month-to-date</h1>
                    <div className="flex flex-row items-center space-x-2">
                        <div className="text-xl font-bold">{formattedAmount}</div>
                        <Badge className="h-6 rounded-md border-green-200 bg-green-100 px-1 py-0 text-green-800">
                            +{data.change}%
                        </Badge>
                    </div>
                </div>
                <div className="relative w-full">
                    <div className="absolute right-0 w-full max-w-[250px] h-[55px] flex items-end">
                        <div className="flex items-end w-full h-full">
                            {data.data.map((value: number, index: number) => (
                                <div
                                    key={index}
                                    className="flex-1 mx-[1px]"
                                    style={{
                                        height: `${(value / max) * 100}%`,
                                        backgroundColor: `${primaryColorHex}25`,
                                        borderRadius: '2px',
                                        transition: 'height 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="absolute right-0 w-full max-w-[250px] h-[55px] flex items-end">
                        <div className="flex items-end w-full h-full">
                            {[5, 10, 15, 0, 20, 25, 50, 40, 35, 30, 45, 55].map((value, index) => (
                                <div
                                    key={index}
                                    className="flex-1 mx-[1px]"
                                    style={{
                                        height: `${(value / max) * 100}%`,
                                        backgroundColor: '#6366f1',
                                        borderRadius: '2px',
                                        transition: 'height 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default MonthToDateWidget;