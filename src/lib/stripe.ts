import Stripe from 'stripe';

// Centralized Stripe configuration
export const stripeConfig = {
  apiVersion: '2024-12-18.acacia' as const,
  // Use the latest stable API version that supports all features we need
};

// Create Stripe instance with proper configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: stripeConfig.apiVersion,
  // Enable telemetry for better debugging
  telemetry: true,
});

// Environment variable validation
export function validateStripeEnvironment() {
  const required = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
  }

  // Validate Stripe key format
  const secretKey = process.env.STRIPE_SECRET_KEY!;
  if (!secretKey.startsWith('sk_')) {
    throw new Error('Invalid STRIPE_SECRET_KEY format. Must start with "sk_"');
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  if (!publishableKey.startsWith('pk_')) {
    throw new Error('Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Must start with "pk_"');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  if (!webhookSecret.startsWith('whsec_')) {
    throw new Error('Invalid STRIPE_WEBHOOK_SECRET format. Must start with "whsec_"');
  }

  return true;
}

// Helper function to create checkout sessions with consistent configuration
export async function createCheckoutSession(params: {
  templateId: string;
  templateName: string;
  price: number;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.templateName,
            description: `Professional dApp template: ${params.templateName}`,
            images: [`https://dapp-factory.com/templates/${params.templateId}-preview.png`],
          },
          unit_amount: params.price * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl || `${baseUrl}/templates/success?session_id={CHECKOUT_SESSION_ID}&templateId=${params.templateId}&templateName=${encodeURIComponent(params.templateName)}`,
    cancel_url: params.cancelUrl || `${baseUrl}/templates`,
    metadata: {
      templateId: params.templateId,
      templateName: params.templateName,
      price: params.price.toString(),
    },
    customer_email: undefined, // Will be collected in checkout
    billing_address_collection: 'auto',
    allow_promotion_codes: true,
    automatic_tax: {
      enabled: true,
    },
  });
}

// Helper function to create payment intents with consistent configuration
export async function createPaymentIntent(params: {
  amount: number;
  paymentMethodId: string;
  generationId: string;
  customerEmail: string;
  productType?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return await stripe.paymentIntents.create({
    amount: Math.round(params.amount),
    currency: 'usd',
    payment_method: params.paymentMethodId,
    confirmation_method: 'manual',
    confirm: true,
    metadata: {
      generationId: params.generationId,
      productType: params.productType || 'generation',
      customerEmail: params.customerEmail,
    },
    return_url: `${baseUrl}/success?session_id=${params.generationId}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}
