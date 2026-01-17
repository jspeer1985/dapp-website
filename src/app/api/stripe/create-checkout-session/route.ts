import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not configured');
      return NextResponse.json(
        { error: 'Payment system is not properly configured. Please contact support.' },
        { status: 500 }
      );
    }

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: templateName,
              description: `Professional dApp template: ${templateName}`,
              images: [`https://dapp-factory.com/templates/${templateId}-preview.png`],
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/templates/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/templates`,
      metadata: {
        templateId,
        templateName,
        price: price.toString(),
      },
      customer_email: undefined, // Will be collected in checkout
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
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
