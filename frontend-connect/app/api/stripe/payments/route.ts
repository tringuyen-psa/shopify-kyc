import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

// Cache payments data for 5 minutes with account-specific keys
const getPayments = unstable_cache(
  async (accountId: string, page: number = 1, limit: number = 50) => {
    console.log(`Fetching payments for account ${accountId}, page ${page}`);

    try {
      // Calculate date range for last 30 days to reduce data size
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

      const charges = await stripe.charges.list(
        {
          limit: Math.min(limit, 100), // Cap at 100 for performance
          created: { gt: thirtyDaysAgo }, // Last 30 days only
          expand: ['data.balance_transaction'], // Expand in single call
        },
        {
          stripeAccount: accountId,
        }
      );

      // Optimized data transformation
      const payments = charges.data.map((charge) => {
        const status = charge.refunded
          ? "refunded"
          : charge.disputed
            ? "disputed"
            : charge.status === 'succeeded'
              ? "succeeded"
              : charge.status || "pending";

        return {
          id: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency.toUpperCase(),
          status,
          from: charge.billing_details?.email || charge.receipt_email || "N/A",
          date: new Date(charge.created * 1000).toISOString(), // Use ISO for better parsing
          description: charge.description,
          metadata: charge.metadata,
          // Add fee information if available
          fee: (typeof charge.balance_transaction === 'object' && charge.balance_transaction?.fee) ?
            (charge.balance_transaction.fee / 100) : 0,
          net: (typeof charge.balance_transaction === 'object' && charge.balance_transaction?.net) ?
            (charge.balance_transaction.net / 100) : (charge.amount / 100),
        };
      });

      return {
        payments,
        hasMore: charges.has_more,
        totalCount: payments.length, // Stripe API doesn't provide total_count for charges
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error in cached getPayments:', error);
      throw error;
    }
  },
  ['stripe-payments'],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['payments', 'stripe']
  }
);

export async function GET(request: NextRequest) {
  try {
    const accountId = request.headers.get("x-stripe-account");
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

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

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await getPayments(accountId, page, limit);
    const endTime = Date.now();

    return NextResponse.json({
      ...result,
      page,
      limit,
      performance: {
        fetchTime: endTime - startTime,
        cached: result.lastUpdated < (endTime - 1000), // If data is older than 1s, it's from cache
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Fetch-Time': `${endTime - startTime}ms`,
      }
    });

  } catch (error: any) {
    console.error("Error fetching payments:", error);

    // Return more specific error messages
    const errorMessage = error.type === 'StripeInvalidRequestError'
      ? 'Invalid account ID or permissions'
      : error.message || 'Failed to fetch payments';

    return NextResponse.json(
      {
        error: errorMessage,
        type: error.type || 'api_error',
        timestamp: Date.now(),
      },
      {
        status: error.status || 500,
        headers: {
          'Cache-Control': 'no-cache',
        }
      }
    );
  }
}