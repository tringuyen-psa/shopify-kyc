import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const demoAccountId = process.env.DEMO_ACCOUNT_ID;

    if (!demoAccountId) {
      return NextResponse.json({
        error: "DEMO_ACCOUNT_ID not configured",
        status: "missing_config"
      }, { status: 500 });
    }

    console.log('Testing demo account access:', demoAccountId);

    // Test if we can retrieve the account
    const account = await stripe.accounts.retrieve(demoAccountId);

    // Check if it's a custom account
    const isCustom =
      account?.controller?.stripe_dashboard?.type === 'none' &&
      account?.controller?.losses?.payments === 'application' &&
      account?.controller?.requirement_collection === 'application';

    return NextResponse.json({
      success: true,
      accountId: account.id,
      accountType: account.type,
      isCustom: isCustom,
      businessName: account.business_profile?.name,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      country: account.country,
      controller: account.controller
    });

  } catch (error: any) {
    console.error('Demo account test failed:', error);

    return NextResponse.json({
      error: error.message,
      type: error.type,
      stripeCode: error.code,
      status: "access_failed"
    }, { status: 500 });
  }
}