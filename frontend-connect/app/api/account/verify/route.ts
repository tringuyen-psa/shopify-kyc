import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Verify account exists and is accessible
    const account = await stripe.accounts.retrieve(accountId);

    // Check if it's a custom account (supports auth bypass)
    const isCustom =
      account?.controller?.stripe_dashboard?.type === "none" &&
      account?.controller?.losses?.payments === "application" &&
      account?.controller?.requirement_collection === "application";

    return NextResponse.json({
      accountId: account.id,
      email: account.email,
      type: isCustom ? "custom" : account.type,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      country: account.country,
    });
  } catch (error: any) {
    console.error("Error verifying account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}