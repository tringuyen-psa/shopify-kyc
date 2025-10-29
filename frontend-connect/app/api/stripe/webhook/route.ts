import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Stripe signature is required" },
        { status: 400 }
      );
    }

    // Verify webhook signature (you'll need to configure webhook secret in .env)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("Webhook secret not configured, skipping signature verification");
    } else {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      // Handle webhook events
      switch (event.type) {
        case 'account.updated':
          const account = event.data.object as any;
          console.log('Account updated:', account.id);
          break;

        case 'payout.created':
          const payout = event.data.object as any;
          console.log('Payout created:', payout.id);
          break;

        case 'charge.succeeded':
          const charge = event.data.object as any;
          console.log('Charge succeeded:', charge.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}