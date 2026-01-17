import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeEnvironment, createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe environment
    validateStripeEnvironment();

    const { templateId, templateName, price } = await req.json();

    console.log('Creating checkout session:', { templateId, templateName, price });

    if (!templateId || !templateName || !price) {
      console.error('Missing required fields:', { templateId, templateName, price });
      return NextResponse.json(
        { error: 'Missing required fields: templateId, templateName, and price are required' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      console.error('Invalid price:', price);
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      templateId,
      templateName,
      price,
    });

    console.log('Stripe session created successfully:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Payment system configuration error. Please contact support.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
