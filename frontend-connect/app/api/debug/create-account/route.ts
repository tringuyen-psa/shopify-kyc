import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email = 'test@example.com', businessName = 'Test Business' } = await request.json();

    console.log('=== DEBUG: Creating Custom Account ===');
    console.log('Email:', email);
    console.log('Business Name:', businessName);

    // Test 1: Try Express first (should work)
    console.log('\n--- Testing Express Account Creation ---');
    try {
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
          support_email: email,
        },
      });

      console.log('✅ Express account created:', expressAccount.id);

      return NextResponse.json({
        success: true,
        type: 'express',
        accountId: expressAccount.id,
        message: 'Express account created successfully'
      });

    } catch (expressError: any) {
      console.error('❌ Express account failed:', expressError.message);

      // Test 2: Try Custom
      console.log('\n--- Testing Custom Account Creation ---');
      try {
        const customAccount = await stripe.accounts.create({
          type: 'custom',
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
            support_email: email,
          },
          individual: {
            first_name: businessName.split(' ')[0] || 'Test',
            last_name: businessName.split(' ').slice(1).join(' ') || 'User',
            email: email,
          },
        });

        console.log('✅ Custom account created:', customAccount.id);

        return NextResponse.json({
          success: true,
          type: 'custom',
          accountId: customAccount.id,
          message: 'Custom account created successfully'
        });

      } catch (customError: any) {
        console.error('❌ Custom account failed:', customError.message);

        // Test 3: Try Basic Custom
        console.log('\n--- Testing Basic Custom Account ---');
        try {
          const basicAccount = await stripe.accounts.create({
            type: 'custom',
            country: 'US',
            email: email,
            business_type: 'individual',
          });

          console.log('✅ Basic custom account created:', basicAccount.id);

          return NextResponse.json({
            success: true,
            type: 'custom_basic',
            accountId: basicAccount.id,
            message: 'Basic custom account created successfully'
          });

        } catch (basicError: any) {
          console.error('❌ Basic custom account failed:', basicError.message);

          return NextResponse.json({
            success: false,
            error: 'All account creation methods failed',
            details: {
              express: expressError.message,
              custom: customError.message,
              basic: basicError.message,
            }
          }, { status: 500 });
        }
      }
    }

  } catch (error: any) {
    console.error('=== DEBUG: General Error ===', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code,
    }, { status: 500 });
  }
}