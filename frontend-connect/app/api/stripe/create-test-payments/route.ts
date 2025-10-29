import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { accountManager } from "@/lib/stripe-account";

export async function POST(request: NextRequest) {
  try {
    const { count, amount, status, currency } = await request.json();

    // Get account ID from request (for demo, use stored account)
    const accountId = process.env.DEMO_ACCOUNT_ID || accountManager.getAccountId();

    if (!accountId) {
      return NextResponse.json(
        { error: "No account found" },
        { status: 400 }
      );
    }

    // Create test payments based on status
    const payments = [];

    for (let i = 0; i < parseInt(count); i++) {
      const paymentAmount = amount || (Math.floor(Math.random() * 500) + 50) * 100; // Random amount between $50-$550 in cents

      let paymentData: any = {
        amount: paymentAmount,
        currency: currency.toLowerCase(),
        payment_method: 'pm_card_visa',
        confirm: true,
        description: `Test payment #${i + 1}`,
        metadata: {
          test_payment: 'true',
          created_by: 'stripe_connect_demo'
        }
      };

      // Add specific handling for different payment statuses
      switch (status) {
        case 'card_disputed_fraudulent':
          // Create a payment then dispute it
          paymentData.metadata.dispute_type = 'fraudulent';
          break;
        case 'card_disputed_product_not_received':
          paymentData.metadata.dispute_type = 'product_not_received';
          break;
        case 'card_disputed_inquiry':
          paymentData.metadata.dispute_type = 'inquiry';
          break;
        case 'card_uncaptured':
          paymentData.capture_method = 'manual';
          break;
        case 'ach_direct_debit':
          paymentData.payment_method = 'pm_test_us_bank_account';
          paymentData.confirm = false; // ACH requires manual confirmation
          break;
        case 'sepa_debit':
          paymentData.payment_method = 'pm_test_sepa_debit';
          paymentData.confirm = false; // SEPA requires manual confirmation
          break;
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create(paymentData, {
          stripeAccount: accountId
        });

        // For disputed payments, we would normally create a dispute
        // But disputes cannot be created via API for security reasons
        // Instead, we'll mark this as disputed in our metadata
        if (status.includes('disputed')) {
          paymentIntent.metadata.dispute_type = status.includes('fraudulent') ? 'fraudulent' : 'product_not_received';
        }

        payments.push({
          id: paymentIntent.id,
          amount: paymentAmount / 100,
          currency: currency.toUpperCase(),
          status: status.includes('disputed') ? 'disputed' : paymentIntent.status,
          date: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error creating payment ${i + 1}:`, error);
        // Continue creating other payments even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      payments: payments,
      message: `Successfully created ${payments.length} test payments`
    });

  } catch (error: any) {
    console.error("Error creating test payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test payments" },
      { status: 500 }
    );
  }
}