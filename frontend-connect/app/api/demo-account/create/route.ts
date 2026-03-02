import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    // Generate unique email and business name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const email = `demo-${timestamp}-${randomId}@furever-demo.com`;
    const businessName = `Furever Demo ${randomId.toUpperCase()}`;

    console.log("Creating new demo account:", { email, businessName });

    // Create Custom connected account (allows full embedded component access)
    // Note: Do NOT use `type` parameter together with `controller` - they are mutually exclusive
    const account = await stripe.accounts.create({
      country: "US",
      email: email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      // Controller settings - platform handles everything (implicitly creates custom account)
      controller: {
        // Platform handles verification requirements
        requirement_collection: "application",
        // Platform handles payment disputes and losses
        losses: {
          payments: "application",
        },
        // Platform handles fees
        fees: {
          payer: "application",
        },
        // No Stripe Dashboard access for the connected account
        stripe_dashboard: {
          type: "none",
        },
      },
    });

    console.log("Demo account created:", account.id);

    return NextResponse.json({
      success: true,
      accountId: account.id,
      email: email,
      businessName: businessName,
      type: "demo",
    });
  } catch (error: any) {
    console.error("Error creating demo account:", error);
    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// GET: List all demo accounts from Stripe
export async function GET() {
  try {
    const stripeAccounts = await stripe.accounts.list({ limit: 100 });

    const accounts = stripeAccounts.data
      .filter(acc => acc.email?.includes("furever-demo.com"))
      .map(acc => ({
        accountId: acc.id,
        createdAt: new Date(acc.created * 1000).toISOString(),
        email: acc.email,
        businessName: acc.business_profile?.name || "Demo Account",
      }));

    return NextResponse.json({
      success: true,
      accounts: accounts,
      total: accounts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
