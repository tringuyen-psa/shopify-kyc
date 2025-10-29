import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { unstable_cache } from 'next/cache';
import { getStripeAccountId, createStripeErrorResponse } from "@/lib/stripe-api-utils";

export const dynamic = 'force-dynamic';

// Cache balance data for 1 minute (balances change frequently)
const getBalance = unstable_cache(
  async (accountId: string) => {
    console.log(`Fetching balance for account ${accountId}`);

    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      // Format balance data for better frontend consumption
      const formattedBalance = {
        available: balance.available.map(item => ({
          amount: item.amount / 100,
          currency: item.currency.toUpperCase(),
        })),
        pending: balance.pending.map(item => ({
          amount: item.amount / 100,
          currency: item.currency.toUpperCase(),
        })),
        connect_reserved: balance.connect_reserved?.map(item => ({
          amount: item.amount / 100,
          currency: item.currency.toUpperCase(),
        })) || [],
        last_updated: Date.now(),
        // Add summary calculations
        total_available: balance.available.reduce((sum, item) => sum + item.amount, 0) / 100,
        total_pending: balance.pending.reduce((sum, item) => sum + item.amount, 0) / 100,
      };

      return formattedBalance;
    } catch (error) {
      console.error('Error in cached getBalance:', error);
      throw error;
    }
  },
  ['stripe-balance'],
  {
    revalidate: 60, // Cache for 1 minute - balances change frequently
    tags: ['balance', 'stripe']
  }
);

export async function GET(request: NextRequest) {
  try {
    // Get account ID with fallbacks for authentication bypass
    const accountId = getStripeAccountId(request);

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-cache',
          }
        }
      );
    }

    const startTime = Date.now();
    const balance = await getBalance(accountId);
    const endTime = Date.now();

    return NextResponse.json({
      ...balance,
      performance: {
        fetchTime: endTime - startTime,
        cached: balance.last_updated < (endTime - 1000),
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Fetch-Time': `${endTime - startTime}ms`,
      }
    });

  } catch (error: any) {
    console.error("Error fetching balance:", error);

    // Handle specific Stripe errors
    let errorMessage = 'Failed to fetch balance';
    let statusCode = 500;

    if (error.type === 'StripePermissionError' || error.code === 'account_invalid') {
      // Provide mock demo balance data for permission errors
      return NextResponse.json({
        available: [
          {
            amount: 12550, // $125.50
            currency: 'USD',
          }
        ],
        pending: [
          {
            amount: 2500, // $25.00
            currency: 'USD',
          }
        ],
        connect_reserved: [
          {
            amount: 0,
            currency: 'USD',
          }
        ],
        livemode: false,
        object: 'balance',
        pending_reserved: [
          {
            amount: 0,
            currency: 'USD',
          }
        ],
        demo: true,
        performance: {
          fetchTime: 0,
          cached: false,
        }
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid account ID or insufficient permissions';
      statusCode = 403;
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'Stripe API temporarily unavailable';
      statusCode = 503;
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Network error - please try again';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        type: error.type || 'api_error',
        timestamp: Date.now(),
        // Provide fallback data for better UX
        fallback_data: {
          available: [{ amount: 0, currency: 'USD' }],
          pending: [{ amount: 0, currency: 'USD' }],
          total_available: 0,
          total_pending: 0,
        }
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache',
        }
      }
    );
  }
}