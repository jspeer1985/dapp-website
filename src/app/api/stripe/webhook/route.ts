import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, validateStripeEnvironment } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';
import type Stripe from 'stripe';

const logger = createLogger('StripeWebhook');

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSession(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const jobId = session.metadata?.jobId;
  const productType = session.metadata?.productType;
  const templateId = session.metadata?.templateId;
  const templateName = session.metadata?.templateName;
  const price = session.metadata?.price;

  logger.info({ jobId, templateId, sessionId: session.id }, 'Processing successful Stripe checkout');

  try {
    await connectToDatabase();

    // Handle template purchase
    if (templateId && templateName) {
      await handleTemplatePurchase(session, templateId, templateName, price);
      return;
    }

    // Handle generation payment
    if (!jobId) {
      logger.error('No jobId found in session metadata');
      return;
    }

    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      logger.error({ jobId }, 'Generation record not found for paying customer');
      return;
    }

    // Update status to paid
    generation.payment.status = 'confirmed';
    generation.payment.currency = 'USD';
    generation.payment.amount = (session.amount_total ?? 0) / 100;
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();

    await generation.save();

    logger.info({ jobId }, 'Order marked as PAID via Stripe');

    // Trigger generation asynchronously
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/generations/${jobId}/generate`, {
      method: 'POST',
      headers: { 'X-Internal-Request': 'true' }
    }).catch(err => logger.error({ jobId, err }, 'Failed to trigger background generation'));

  } catch (error) {
    logger.error({ jobId, templateId, error }, 'Error fulfilling Stripe order');
  }
}

async function handleTemplatePurchase(session: Stripe.Checkout.Session, templateId: string, templateName: string, price: string) {
  const customerEmail = session.customer_details?.email;
  
  logger.info({ templateId, templateName, customerEmail }, 'Processing template purchase');

  try {
    // Create template purchase record
    const TemplatePurchase = require('@/models/TemplatePurchase').default;
    
    const purchase = new TemplatePurchase({
      sessionId: session.id,
      templateId,
      templateName,
      price: parseFloat(price),
      currency: 'USD',
      customerEmail,
      status: 'completed',
      purchaseDate: new Date(),
      stripeCustomerId: session.customer,
    });

    await purchase.save();

    // Send purchase confirmation email
    if (customerEmail) {
      await sendTemplatePurchaseEmail(customerEmail, templateName, templateId);
    }

    logger.info({ templateId, customerEmail }, 'Template purchase completed successfully');

  } catch (error) {
    logger.error({ templateId, error }, 'Error processing template purchase');
  }
}

async function sendTemplatePurchaseEmail(email: string, templateName: string, templateId: string) {
  // Implement email sending logic
  logger.info({ email, templateName, templateId }, 'Sending template purchase confirmation email');
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
}
