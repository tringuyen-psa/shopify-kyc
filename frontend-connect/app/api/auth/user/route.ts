import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName } = await request.json();

    // Validate input
    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Email, password, and business name are required' },
        { status: 400 }
      );
    }

    // Simple authentication for demo - in production, use proper user management
    // For now, any valid email/password combination works
    if (!email.includes('@') || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create or retrieve a Stripe Connect account for this user
    let stripeAccountId;

    try {
      console.log('Creating Custom Stripe account for:', { email, businessName });

      // Create a new Custom account for the user
      const accountParams = {
        type: 'custom' as const,
        country: 'US',
        email: email,
        business_type: 'individual' as const,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: businessName,
          product_description: 'E-commerce and digital services',
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}`,
          support_email: email,
        },
        // Required individual details for Custom accounts
        individual: {
          first_name: businessName.split(' ')[0] || 'User',
          last_name: businessName.split(' ').slice(1).join(' ') || 'Account',
          email: email,
        },
        // Simple controller config
        controller: {
          stripe_dashboard: {
            type: 'none' as const,
          },
        },
        metadata: {
          created_by: 'platform_api',
          source: 'user_registration',
        },
      };

      console.log('Account creation parameters:', JSON.stringify(accountParams, null, 2));

      const account = await stripe.accounts.create(accountParams);
      console.log('Custom account created successfully:', account.id);

      stripeAccountId = account.id;

      // Account creation successful - the home page will handle onboarding

      return NextResponse.json({
        success: true,
        user: {
          email,
          businessName,
          stripeAccountId,
          accountType: 'custom',
          isOnboarded: false,
        },
        message: 'Custom account created successfully. Redirecting to home...',
      });

    } catch (stripeError: any) {
      console.error('Stripe account creation error:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        param: stripeError.param,
        statusCode: stripeError.statusCode,
        raw: JSON.stringify(stripeError, null, 2)
      });

      // Try creating Express account as fallback
      try {
        console.log('Attempting to create Express account as fallback...');

        const expressAccount = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: email,
          business_type: 'individual',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            name: businessName,
            product_description: 'E-commerce and digital services',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}`,
            support_email: email,
          },
        });

        console.log('Express account created successfully:', expressAccount.id);
        stripeAccountId = expressAccount.id;

        return NextResponse.json({
          success: true,
          user: {
            email,
            businessName,
            stripeAccountId,
            accountType: 'express',
            isOnboarded: false,
          },
          message: 'Express account created successfully. Redirecting to home...',
          fallback: true,
        });

      } catch (expressError: any) {
        console.error('Express account fallback also failed:', expressError);
        return NextResponse.json(
          {
            error: 'Failed to create Stripe account',
            details: stripeError.message,
            expressError: expressError.message,
            type: stripeError.type,
            code: stripeError.code
          },
          { status: 500 }
        );
      }
    }

  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get user info from existing Stripe account
  try {
    const accountId = request.headers.get('x-stripe-account');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      success: true,
      user: {
        email: account.email,
        businessName: account.business_profile?.name || 'Business',
        stripeAccountId: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        isOnboarded: account.charges_enabled && account.payouts_enabled,
        created: account.created,
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user info' },
      { status: 500 }
    );
  }
}