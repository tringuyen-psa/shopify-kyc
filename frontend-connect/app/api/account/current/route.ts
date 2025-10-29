import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { unstable_cache } from 'next/cache';
import { getStripeAccountId, createStripeErrorResponse } from "@/lib/stripe-api-utils";

export const dynamic = 'force-dynamic';

// Cache account data for 10 minutes (account details change infrequently)
const getAccount = unstable_cache(
  async (accountId: string) => {
    console.log(`Fetching account details for ${accountId}`);

    try {
      const account = await stripe.accounts.retrieve(accountId, {
        expand: ['capabilities', 'requirements', 'business_profile']
      });

      // Enhanced account data with relevant information
      const enhancedAccount = {
        id: account.id,
        email: account.email,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        created: account.created,
        country: account.country,
        default_currency: account.default_currency,
        type: account.type,
        business_profile: {
          name: account.business_profile?.name,
          url: account.business_profile?.url,
          support_email: account.business_profile?.support_email,
        },
        capabilities: account.capabilities,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          past_due: account.requirements?.past_due || [],
          disabled_reason: account.requirements?.disabled_reason,
        },
        metadata: account.metadata,
        // Add computed fields
        is_fully_enabled: account.charges_enabled && account.payouts_enabled,
        has_requirements: (account.requirements?.currently_due?.length || 0) > 0,
        last_updated: Date.now(),
      };

      return enhancedAccount;
    } catch (error) {
      console.error('Error in cached getAccount:', error);
      throw error;
    }
  },
  ['stripe-account'],
  {
    revalidate: 600, // Cache for 10 minutes - account details change infrequently
    tags: ['account', 'stripe']
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
    const account = await getAccount(accountId);
    const endTime = Date.now();

    return NextResponse.json({
      ...account,
      performance: {
        fetchTime: endTime - startTime,
        cached: account.last_updated < (endTime - 1000),
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900',
        'X-Fetch-Time': `${endTime - startTime}ms`,
      }
    });

  } catch (error: any) {
    console.error("Error fetching account:", error);

    // If it's a permission error, provide mock demo data
    if (error.type === 'StripePermissionError' || error.code === 'account_invalid') {
      console.log('Permission error - providing mock demo account data');

      const mockDemoAccount = {
        id: process.env.DEMO_ACCOUNT_ID || 'demo_account_id',
        email: 'demo@furever.com',
        charges_enabled: true,
        payouts_enabled: true,
        created: Date.now() - 86400000, // 1 day ago
        country: 'US',
        default_currency: 'usd',
        type: 'custom',
        business_profile: {
          name: process.env.DEMO_ACCOUNT_NAME || 'Furever Demo Account',
          url: 'https://furever.com',
          support_email: 'support@furever.com',
        },
        capabilities: {
          card_payments: 'active',
          transfers: 'active',
          tax_reporting_us_1099_k: 'active',
          tax_reporting_us_1099_misc: 'active',
        },
        requirements: {
          currently_due: [],
          eventually_due: [],
          past_due: [],
          disabled_reason: null,
        },
        metadata: { demo: 'true' },
        is_fully_enabled: true,
        has_requirements: false,
        last_updated: Date.now(),
      };

      return NextResponse.json({
        ...mockDemoAccount,
        performance: {
          fetchTime: 0,
          cached: false,
        },
        demo: true
      });
    }

    // Use centralized error handling for other errors
    const errorResponse = createStripeErrorResponse(error);

    return NextResponse.json(
      {
        error: errorResponse.error,
        type: errorResponse.type,
        timestamp: errorResponse.timestamp,
      },
      {
        status: errorResponse.statusCode,
        headers: {
          'Cache-Control': 'no-cache',
        }
      }
    );
  }
}