import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (type === "demo") {
      const demoAccountId = process.env.DEMO_ACCOUNT_ID;

      if (!demoAccountId) {
        return NextResponse.json(
          { error: "Demo account not configured in .env" },
          { status: 400 }
        );
      }

      // Verify demo account exists
      const account = await stripe.accounts.retrieve(demoAccountId);

      return NextResponse.json({
        accountId: account.id,
        email: account.email,
        type: "demo",
      });
    }

    return NextResponse.json(
      { error: "Invalid account type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error verifying account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}