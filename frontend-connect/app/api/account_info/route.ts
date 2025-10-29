import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return mock account info
    // In a real implementation, you would fetch this from your database
    const mockAccountInfo = {
      businessName: "Furever Pet Services",
      email: "contact@furever.com",
      password: "demo123", // In production, never return passwords
      changedPassword: false,
    };

    // If you want to fetch real Stripe account data:
    const accountId = request.headers.get("x-stripe-account");

    if (accountId && accountId !== "demo" && accountId !== "null" && accountId !== "undefined") {
      try {
        console.log(`Fetching account info for Stripe account: ${accountId}`);
        const account = await stripe.accounts.retrieve(accountId);

        return NextResponse.json({
          businessName: account.business_profile?.name || "Furever Pet Services",
          email: account.email || "contact@furever.com",
          password: "", // Never return real passwords
          changedPassword: true,
          stripeAccount: {
            id: account.id,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            country: account.country,
          }
        });
      } catch (stripeError: any) {
        console.error('Error fetching Stripe account:', stripeError.message);
        // Fall back to mock data
        return NextResponse.json(mockAccountInfo);
      }
    }

    // Return mock data for demo or when no account ID is provided
    console.log('Returning mock account info for demo');
    return NextResponse.json(mockAccountInfo);
  } catch (error: any) {
    console.error("Error fetching account info:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}