import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    // Get accountId from query params or header
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") || request.headers.get("x-stripe-account");

    if (!accountId) {
      return NextResponse.json({
        error: "accountId is required (pass as query param or x-stripe-account header)",
        status: "missing_account_id"
      }, { status: 400 });
    }

    console.log('Testing account access:', accountId);

    // Test if we can retrieve the account
    const account = await stripe.accounts.retrieve(accountId);

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