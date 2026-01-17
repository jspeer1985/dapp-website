// ========================================
// PRODUCTION STRIPE INTEGRATION
// Complete payment flow with webhooks
// ========================================

import Stripe from 'stripe';
import express, { Request, Response } from 'express';
import crypto from 'crypto';

// ============================================================
// STRIPE CONFIGURATION
// ============================================================

// Create Stripe instance with proper configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
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

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface CheckoutSessionParams {
  templateId: string;
  templateName: string;
  price: number;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

interface PaymentIntentParams {
  amount: number;
  paymentMethodId: string;
  generationId: string;
  customerEmail: string;
  productType?: string;
  customerId?: string;
}

interface SubscriptionParams {
  customerId: string;
  priceId: string;
  tier: string;
  plan: 'monthly' | 'annual';
  metadata?: Record<string, string>;
}

interface Customer {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  metadata?: Record<string, string>;
}

// ============================================================
// STRIPE PRICES CONFIGURATION
// ============================================================

export const STRIPE_PRICES = {
  subscriptions: {
    starter: {
      monthly: 'price_starter_monthly',
      annual: 'price_starter_annual'
    },
    professional: {
      monthly: 'price_professional_monthly',
      annual: 'price_professional_annual'
    },
    enterprise: {
      monthly: 'price_enterprise_monthly',
      annual: 'price_enterprise_annual'
    }
  },
  usageBased: {
    'project.generate': 'price_project_generation',
    'project.deploy': 'price_project_deployment',
    'contract.upgrade': 'price_contract_upgrade',
    'contract.verify': 'price_contract_verify',
    'analytics.export': 'price_analytics_export'
  }
};

// ============================================================
// CUSTOMER MANAGER
// ============================================================

class StripeCustomerManager {
  
  async createOrGetCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: params.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        ...params.metadata,
        createdAt: new Date().toISOString(),
        source: 'launchpad_platform'
      }
    });
  }

  async updateCustomer(
    customerId: string,
    updates: {
      name?: string;
      email?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, updates);
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  }
}

// ============================================================
// CHECKOUT SESSION MANAGER
// ============================================================

class CheckoutSessionManager {
  
  async createCheckoutSession(params: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
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
              images: [`${baseUrl}/templates/${params.templateId}-preview.png`],
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
        ...params.metadata
      },
      customer: params.customerId,
      customer_email: params.customerId ? undefined : undefined, // Will be collected if no customer
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      // automatic_tax requires business address in Stripe dashboard
      // Enable after configuring at https://dashboard.stripe.com/settings/tax
      // automatic_tax: { enabled: true },
    });
  }

  async createSubscriptionCheckout(params: {
    customerId: string;
    priceId: string;
    tier: string;
    plan: 'monthly' | 'annual';
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<Stripe.Checkout.Session> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return await stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&subscription=success`,
      cancel_url: params.cancelUrl || `${baseUrl}/pricing`,
      metadata: {
        tier: params.tier,
        plan: params.plan
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // automatic_tax requires business address in Stripe dashboard
      // Enable after configuring at https://dashboard.stripe.com/settings/tax
      // automatic_tax: { enabled: true },
      subscription_data: {
        metadata: {
          tier: params.tier,
          plan: params.plan
        }
      }
    });
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent', 'subscription']
    });
  }
}

// ============================================================
// PAYMENT INTENT MANAGER
// ============================================================

class PaymentIntentManager {
  
  async createPaymentIntent(params: PaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return await stripe.paymentIntents.create({
      amount: Math.round(params.amount),
      currency: 'usd',
      payment_method: params.paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      customer: params.customerId,
      metadata: {
        generationId: params.generationId,
        productType: params.productType || 'generation',
        customerEmail: params.customerEmail,
      },
      return_url: `${baseUrl}/success?session_id=${params.generationId}`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
    });
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.confirm(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }
}

// ============================================================
// SUBSCRIPTION MANAGER
// ============================================================

class SubscriptionManager {
  
  async createSubscription(params: SubscriptionParams): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: {
        tier: params.tier,
        plan: params.plan,
        ...params.metadata
      },
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    });
  }

  async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId
        }
      ],
      metadata,
      proration_behavior: 'create_prorations'
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method']
    });
  }
}

// ============================================================
// USAGE RECORDING (For Usage-Based Billing)
// ============================================================

class UsageRecorder {
  
  async recordUsage(params: {
    subscriptionItemId: string;
    quantity: number;
    timestamp?: number;
    action?: string;
  }): Promise<any> {
    // Create usage record using the correct Stripe API method
    const usageRecordParams = {
      quantity: params.quantity,
      timestamp: params.timestamp || Math.floor(Date.now() / 1000),
      action: (params.action as any) || 'increment'
    };
    
    // Use the raw request method for usage records as it's not directly exposed in the SDK
    return await (stripe as any)._request({
      method: 'POST',
      url: `/v1/subscription_items/${params.subscriptionItemId}/usage_records`,
      data: usageRecordParams
    });
  }

  async getUsageSummary(
    subscriptionItemId: string,
    startTime?: number,
    endTime?: number
  ): Promise<any> {
    // Use the direct API endpoint for retrieving usage records
    const params: any = {
      limit: 100,
    };
    
    if (startTime) params.starting_after = startTime;
    if (endTime) params.ending_before = endTime;
    
    return await (stripe as any)._request({
      method: 'GET',
      url: `/v1/subscription_items/${subscriptionItemId}/usage_records`,
      params
    });
  }
}

// ============================================================
// WEBHOOK HANDLER
// ============================================================

class StripeWebhookHandler {
  
  constructEvent(body: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    try {
      return stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${(error as Error).message}`);
    }
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    console.log(`🔔 Webhook received: ${event.type}`);

    switch (event.type) {
      // Payment events
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Checkout events
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Subscription events
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Invoice events
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Customer events
      case 'customer.created':
        await this.handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Customer: ${paymentIntent.customer}`);
    console.log(`   Metadata:`, paymentIntent.metadata);

    // TODO: Update database
    // TODO: Trigger project generation if needed
    // TODO: Send confirmation email
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
    console.log(`   Reason: ${paymentIntent.last_payment_error?.message}`);

    // TODO: Notify customer
    // TODO: Update database
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log(`✅ Checkout completed: ${session.id}`);
    console.log(`   Customer: ${session.customer}`);
    console.log(`   Amount: $${(session.amount_total! / 100).toFixed(2)}`);
    console.log(`   Metadata:`, session.metadata);

    if (session.mode === 'subscription') {
      console.log(`   Subscription: ${session.subscription}`);
      // TODO: Activate subscription in database
    } else {
      console.log(`   Payment Intent: ${session.payment_intent}`);
      // TODO: Process one-time payment
    }

    // TODO: Send welcome email
    // TODO: Trigger onboarding flow
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`🆕 Subscription created: ${subscription.id}`);
    console.log(`   Customer: ${subscription.customer}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Plan: ${subscription.items.data[0].price.id}`);

    // TODO: Create subscription in database
    // TODO: Grant access to features
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`🔄 Subscription updated: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);

    // Retrieve full subscription to get current_period details
    const fullSubscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscription.id);
    
    if (fullSubscription.cancel_at_period_end) {
      // Use the correct property path for current period end
      const periodEnd = (fullSubscription as any).current_period?.end || 
                       (fullSubscription as any).current_period_end ||
                       fullSubscription.ended_at;
      console.log(`   ⚠️  Will cancel at: ${new Date(periodEnd * 1000)}`);
    }

    // TODO: Update subscription in database
    // TODO: Update feature access
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`🗑️  Subscription deleted: ${subscription.id}`);
    console.log(`   Customer: ${subscription.customer}`);

    // TODO: Revoke feature access
    // TODO: Update database
    // TODO: Send cancellation email
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log(`💵 Invoice paid: ${invoice.id}`);
    console.log(`   Amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
    console.log(`   Subscription: ${(invoice as any).subscription || 'N/A'}`);

    // TODO: Record payment in database
    // TODO: Send receipt email
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`❌ Invoice payment failed: ${invoice.id}`);
    console.log(`   Attempt: ${invoice.attempt_count}`);

    // TODO: Notify customer
    // TODO: Update subscription status if needed
  }

  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    console.log(`👤 Customer created: ${customer.id}`);
    console.log(`   Email: ${customer.email}`);

    // TODO: Create customer in database
  }
}

// ============================================================
// STRIPE SERVICE (Main Entry Point)
// ============================================================

export class StripeService {
  public customers: StripeCustomerManager;
  public checkoutSessions: CheckoutSessionManager;
  public paymentIntents: PaymentIntentManager;
  public subscriptions: SubscriptionManager;
  public usage: UsageRecorder;
  public webhooks: StripeWebhookHandler;

  constructor() {
    // Validate environment before initializing
    validateStripeEnvironment();

    this.customers = new StripeCustomerManager();
    this.checkoutSessions = new CheckoutSessionManager();
    this.paymentIntents = new PaymentIntentManager();
    this.subscriptions = new SubscriptionManager();
    this.usage = new UsageRecorder();
    this.webhooks = new StripeWebhookHandler();
  }

  // Convenience method for creating products
  async createProduct(params: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    return await stripe.products.create({
      name: params.name,
      description: params.description,
      images: params.images,
      metadata: params.metadata
    });
  }

  // Convenience method for creating prices
  async createPrice(params: {
    productId: string;
    unitAmount: number;
    currency?: string;
    recurring?: {
      interval: 'month' | 'year';
    };
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    return await stripe.prices.create({
      product: params.productId,
      unit_amount: params.unitAmount,
      currency: params.currency || 'usd',
      recurring: params.recurring,
      metadata: params.metadata
    });
  }
}

// ============================================================
// EXPRESS WEBHOOK ENDPOINT
// ============================================================

export function createWebhookRouter(): express.Router {
  const router = express.Router();
  const webhookHandler = new StripeWebhookHandler();

  // IMPORTANT: Use raw body for webhook signature verification
  router.post('/webhooks/stripe', 
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).send('Missing stripe-signature header');
        return;
      }

      try {
        const event = webhookHandler.constructEvent(req.body, signature);
        
        // Handle event asynchronously
        webhookHandler.handleEvent(event).catch(error => {
          console.error('Error handling webhook:', error);
        });

        res.json({ received: true });
      } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${(error as Error).message}`);
      }
    }
  );

  return router;
}

// ============================================================
// STARTUP & EXPORT
// ============================================================

export const stripeService = new StripeService();

// Export individual functions for easier importing
export const createCheckoutSession = (params: CheckoutSessionParams) => {
  const manager = new CheckoutSessionManager();
  return manager.createCheckoutSession(params);
};

export const createPaymentIntent = (params: PaymentIntentParams) => {
  const manager = new PaymentIntentManager();
  return manager.createPaymentIntent(params);
};

export {
  StripeCustomerManager,
  CheckoutSessionManager,
  PaymentIntentManager,
  SubscriptionManager,
  UsageRecorder,
  StripeWebhookHandler
};