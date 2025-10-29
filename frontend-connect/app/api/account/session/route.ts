import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { accountId, demoOnboarding, locale } = json;

    let stripeAccountId = accountId;

    // Handle demo onboarding with different accounts based on locale
    if (demoOnboarding !== undefined) {
      const demoAccountId: string = (() => {
        switch (locale) {
          case "fr-FR":
            return process.env.DEMO_ACCOUNT_ID || "acct_1SKwp5GvqAlHbzWt"; // Use your demo account
          case "zh-Hant-HK":
          case "en-GB":
            return process.env.DEMO_ACCOUNT_ID || "acct_1SKwp5GvqAlHbzWt";
          default:
            return process.env.DEMO_ACCOUNT_ID || "acct_1SKwp5GvqAlHbzWt";
        }
      })();

      console.log(
        `Looking for the demo onboarding account ${demoAccountId} for locale ${locale}`
      );

      try {
        const demoOnboardingAccount =
          await stripe.accounts.retrieve(demoAccountId);
        if (demoOnboardingAccount) {
          console.log(
            `Using demo onboarding account: ${demoOnboardingAccount.id} (${demoOnboardingAccount.business_profile?.name || "No business name"})`
          );
          stripeAccountId = demoOnboardingAccount.id;
        } else {
          console.log("No demo onboarding account found");
        }
      } catch (error: any) {
        console.error(
          "Demo account not found, using provided accountId:",
          error.message
        );
        throw new Error(
          `Demo account ${demoAccountId} not found or inaccessible: ${error.message}`
        );
      }
    }

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account found" },
        { status: 400 }
      );
    }

    // Get account details to determine capabilities
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Check if this is a custom account that supports authentication bypass
    const isCustom =
      account?.controller?.stripe_dashboard?.type === "none" &&
      account?.controller?.losses?.payments === "application" &&
      account?.controller?.requirement_collection === "application";

    // Only disable Stripe user authentication for custom accounts
    const disableStripeAuth = isCustom;

    console.log(
      `Account type: ${isCustom ? "Custom" : "Express/Standard"}, Auth bypass: ${disableStripeAuth}`
    );

    // Check if account has issuing and treasury capabilities
    const hasIssuingAndTreasury = ["card_issuing", "treasury"].every(
      (capability) =>
        Object.keys(account?.capabilities || {}).includes(capability)
    );

    const issuingAndTreasuryComponents = {
      issuing_card: {
        enabled: true,
        features: {
          card_management: true,
          cardholder_management: true,
          card_spend_dispute_management: true,
          spend_control_management: true,
        },
      },
      issuing_cards_list: {
        enabled: true,
        features: {
          card_management: true,
          cardholder_management: true,
          card_spend_dispute_management: true,
          spend_control_management: true,
          disable_stripe_user_authentication: isCustom,
        },
      },
      financial_account: {
        enabled: true,
        features: {
          send_money: true,
          transfer_balance: true,
          disable_stripe_user_authentication: isCustom,
        },
      },
      financial_account_transactions: {
        enabled: true,
        features: {
          card_spend_dispute_management: true,
        },
      },
    };

    console.log(`Creating account session for account: ${stripeAccountId}`);

    // Create comprehensive account session
    const accountSession = await stripe.accountSessions.create({
      account: stripeAccountId,
      components: {
        // Payments
        payments: {
          enabled: true,
        },
        balances: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
            disable_stripe_user_authentication: isCustom,
          },
        },
        payouts: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
            disable_stripe_user_authentication: isCustom,
          },
        },
        // Connect
        account_management: {
          enabled: true,
          features: {
            disable_stripe_user_authentication: isCustom,
          },
        },
        account_onboarding: {
          enabled: true,
          features: {
            disable_stripe_user_authentication: isCustom,
          },
        },
        payment_disputes: {
          enabled: true
        },
        documents: { enabled: true },
        notification_banner: {
          enabled: true,
          features: {
            disable_stripe_user_authentication: isCustom,
          },
        },
        ...(hasIssuingAndTreasury ? issuingAndTreasuryComponents : {}),
        tax_settings: {
          enabled: true,
        },
        tax_registrations: {
          enabled: true,
        },
      },
    });
    console.log(`Account session created successfully`);

    if (!accountSession.client_secret) {
      throw new Error("Account session created but no client_secret returned");
    }

    return NextResponse.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error: any) {
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
