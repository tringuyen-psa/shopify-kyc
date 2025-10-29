import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { email, businessName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create Express connected account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      ...(businessName && {
        business_profile: {
          name: businessName,
        },
      }),
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/select-account`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/home`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      type: "live",
    });
  } catch (error: any) {
    console.error("Error creating account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}