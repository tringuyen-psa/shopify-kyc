import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test basic Stripe connectivity
    console.log('Testing Stripe connection...');

    // Test 1: Retrieve account info
    const account = await stripe.accounts.retrieve();
    console.log('Connected account:', account.id, account.type);

    // Test 2: Create a simple test customer
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
    });
    console.log('Test customer created:', customer.id);

    // Clean up test customer
    await stripe.customers.del(customer.id);
    console.log('Test customer deleted');

    return NextResponse.json({
      success: true,
      message: 'Stripe connection working',
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
      },
      test: 'Customer creation/deletion successful'
    });

  } catch (error: any) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        code: error.code,
      },
      { status: 500 }
    );
  }
}