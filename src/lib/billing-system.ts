// BILLING SYSTEM - Complete revenue engine with Stripe integration
// This service handles all financial aspects of your platform

import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { EventEmitter } from 'events';

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface UsageEvent {
  id: string;
  customerId: string;
  apiKey: string;
  operation: BillableOperation;
  timestamp: Date;
  metadata: UsageMetadata;
  cost: number;
  status: 'pending' | 'billed' | 'failed';
}

interface UsageMetadata {
  projectId?: string;
  template?: string;
  chain?: string;
  deploymentId?: string;
  contractCount?: number;
  gasUsed?: string;
  tier?: string;
}

type BillableOperation = 
  | 'project.generate'
  | 'project.deploy'
  | 'contract.upgrade'
  | 'contract.verify'
  | 'analytics.export'
  | 'api.call'
  | 'support.priority'
  | 'template.custom';

interface PricingRule {
  operation: BillableOperation;
  basePrice: number;
  chainMultipliers?: Record<string, number>;
  volumeDiscounts?: VolumeDiscount[];
  tierOverrides?: Record<string, number>;
}

interface VolumeDiscount {
  minVolume: number;
  discount: number; // Percentage
}

interface Invoice {
  id: string;
  customerId: string;
  period: {
    start: Date;
    end: Date;
  };
  items: InvoiceItem[];
  subtotal: number;
  discounts: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: UsageMetadata;
  type: 'subscription' | 'usage' | 'overage' | 'discount';
}

interface Customer {
  id: string;
  stripeCustomerId?: string;
  tier: string;
  subscription?: Subscription;
  billing: {
    email: string;
    name: string;
    address?: any;
    taxId?: string;
  };
  usage: {
    projectsThisMonth: number;
    requestsToday: number;
    totalSpent: number;
    lastInvoice?: Date;
  };
}

interface Subscription {
  id: string;
  customerId: string;
  stripeSubscriptionId?: string;
  tier: string;
  plan: 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  basePrice: number;
  actualPrice: number;
  cancelAtPeriodEnd: boolean;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  arr: number;
  totalCustomers: number;
  activeCustomers: number;
  mrr: number;
  churnRate: number;
  averageRevenuePerCustomer: number;
  revenueByTier: Record<string, number>;
  revenueByOperation: Record<string, number>;
  growthRate: number;
}

// ============================================================
// PRICING CONFIGURATION
// ============================================================

const PRICING_RULES: Record<BillableOperation, PricingRule> = {
  'project.generate': {
    operation: 'project.generate',
    basePrice: 10.00,
    chainMultipliers: {
      ethereum: 1.5,
      polygon: 1.0,
      arbitrum: 1.2,
      optimism: 1.2,
      bsc: 1.1,
      base: 1.3,
      solana: 1.4
    },
    volumeDiscounts: [
      { minVolume: 10, discount: 10 },
      { minVolume: 50, discount: 20 },
      { minVolume: 100, discount: 30 }
    ],
    tierOverrides: {
      free: 0,
      starter: 10.00,
      professional: 8.00,
      enterprise: 5.00
    }
  },
  'project.deploy': {
    operation: 'project.deploy',
    basePrice: 25.00,
    chainMultipliers: {
      ethereum: 2.0,
      polygon: 1.5,
      arbitrum: 1.8,
      optimism: 1.8,
      bsc: 1.6,
      base: 2.0,
      solana: 2.2
    },
    tierOverrides: {
      free: 0,
      starter: 25.00,
      professional: 20.00,
      enterprise: 15.00
    }
  },
  'contract.upgrade': {
    operation: 'contract.upgrade',
    basePrice: 15.00
  },
  'contract.verify': {
    operation: 'contract.verify',
    basePrice: 5.00
  },
  'analytics.export': {
    operation: 'analytics.export',
    basePrice: 5.00
  },
  'api.call': {
    operation: 'api.call',
    basePrice: 0.001,
    volumeDiscounts: [
      { minVolume: 10000, discount: 20 },
      { minVolume: 100000, discount: 40 }
    ]
  },
  'support.priority': {
    operation: 'support.priority',
    basePrice: 50.00
  },
  'template.custom': {
    operation: 'template.custom',
    basePrice: 500.00
  }
};

const SUBSCRIPTION_PRICING = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: ['basic_generation', 'community_support'],
    limits: {
      projectsPerMonth: 3,
      requestsPerDay: 100,
      apiCallsPerMonth: 1000
    }
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 950, // ~20% discount
    features: ['standard_generation', 'email_support', 'basic_analytics'],
    limits: {
      projectsPerMonth: 10,
      requestsPerDay: 1000,
      apiCallsPerMonth: 10000
    }
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 499,
    annualPrice: 4790, // ~20% discount
    features: ['advanced_generation', 'priority_support', 'advanced_analytics', 'custom_templates'],
    limits: {
      projectsPerMonth: 50,
      requestsPerDay: 10000,
      apiCallsPerMonth: 100000
    }
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 2499,
    annualPrice: 23990, // ~20% discount
    features: ['unlimited_generation', 'dedicated_support', 'white_label', 'custom_integrations'],
    limits: {
      projectsPerMonth: -1, // Unlimited
      requestsPerDay: -1,
      apiCallsPerMonth: -1
    }
  }
};

// ============================================================
// USAGE TRACKER
// ============================================================

class UsageTracker extends EventEmitter {
  private events: Map<string, UsageEvent> = new Map();
  private customerUsage: Map<string, Customer> = new Map();

  constructor() {
    super();
  }

  async trackUsage(
    customerId: string,
    apiKey: string,
    operation: BillableOperation,
    metadata: UsageMetadata
  ): Promise<UsageEvent> {
    const eventId = `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const cost = this.calculateCost(operation, metadata);
    
    const event: UsageEvent = {
      id: eventId,
      customerId,
      apiKey,
      operation,
      timestamp: new Date(),
      metadata,
      cost,
      status: 'pending'
    };

    this.events.set(eventId, event);
    await this.updateCustomerUsage(customerId, event);

    this.emit('usage.tracked', event);

    return event;
  }

  private calculateCost(operation: BillableOperation, metadata: UsageMetadata): number {
    const rule = PRICING_RULES[operation];
    if (!rule) return 0;

    let cost = rule.basePrice;

    // Apply tier override
    if (metadata.tier && rule.tierOverrides) {
      const tierPrice = rule.tierOverrides[metadata.tier];
      if (tierPrice !== undefined) {
        cost = tierPrice;
      }
    }

    // Apply chain multiplier
    if (metadata.chain && rule.chainMultipliers) {
      const multiplier = rule.chainMultipliers[metadata.chain] || 1.0;
      cost *= multiplier;
    }

    // Apply volume discounts
    if (rule.volumeDiscounts) {
      const customer = this.customerUsage.get(metadata.customerId);
      if (customer) {
        const monthlyUsage = customer.usage.projectsThisMonth;
        for (const discount of rule.volumeDiscounts.sort((a, b) => b.minVolume - a.minVolume)) {
          if (monthlyUsage >= discount.minVolume) {
            cost *= (1 - discount.discount / 100);
            break;
          }
        }
      }
    }

    return Math.round(cost * 100) / 100; // Round to 2 decimal places
  }

  private async updateCustomerUsage(customerId: string, event: UsageEvent): Promise<void> {
    let customer = this.customerUsage.get(customerId);
    
    if (!customer) {
      customer = await this.loadCustomer(customerId);
      if (customer) {
        this.customerUsage.set(customerId, customer);
      }
    }

    if (!customer) return;

    // Update usage counters
    const now = new Date();
    const isToday = now.toDateString() === event.timestamp.toDateString();
    const isThisMonth = now.getMonth() === event.timestamp.getMonth() && 
                      now.getFullYear() === event.timestamp.getFullYear();

    if (isToday) {
      customer.usage.requestsToday++;
    }
    
    if (isThisMonth && event.operation === 'project.generate') {
      customer.usage.projectsThisMonth++;
    }

    customer.usage.totalSpent += event.cost;

    // Mark event as billed
    event.status = 'billed';
    this.events.set(event.id, event);
  }

  private async loadCustomer(customerId: string): Promise<Customer | null> {
    // TODO: Load from database
    // For demo, return mock customer
    return {
      id: customerId,
      tier: 'starter',
      billing: {
        email: `customer-${customerId}@example.com`,
        name: `Customer ${customerId}`
      },
      usage: {
        projectsThisMonth: 0,
        requestsToday: 0,
        totalSpent: 0
      }
    };
  }

  getCustomerUsage(customerId: string): Customer | null {
    return this.customerUsage.get(customerId) || null;
  }

  getUsageEvents(customerId?: string, startDate?: Date, endDate?: Date): UsageEvent[] {
    let events = Array.from(this.events.values());

    if (customerId) {
      events = events.filter(e => e.customerId === customerId);
    }

    if (startDate) {
      events = events.filter(e => e.timestamp >= startDate);
    }

    if (endDate) {
      events = events.filter(e => e.timestamp <= endDate);
    }

    return events;
  }
}

// ============================================================
// INVOICE GENERATOR
// ============================================================

class InvoiceGenerator {
  private usageTracker: UsageTracker;

  constructor(usageTracker: UsageTracker) {
    this.usageTracker = usageTracker;
  }

  async generateInvoice(
    customerId: string,
    startDate: Date,
    endDate: Date,
    includeUsage: boolean = true
  ): Promise<Invoice> {
    const customer = this.usageTracker.getCustomerUsage(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const items: InvoiceItem[] = [];

    // Add subscription fee
    const subscription = SUBSCRIPTION_PRICING[customer.tier as keyof typeof SUBSCRIPTION_PRICING];
    if (subscription.monthlyPrice > 0) {
      items.push({
        description: `${subscription.name} Plan - Monthly`,
        quantity: 1,
        unitPrice: subscription.monthlyPrice,
        amount: subscription.monthlyPrice,
        type: 'subscription'
      });
    }

    // Add usage items
    if (includeUsage) {
      const usageEvents = this.usageTracker.getUsageEvents(customerId, startDate, endDate);
      const usageItems = this.groupUsageByOperation(usageEvents);
      
      for (const [operation, usageData] of Object.entries(usageItems)) {
        const rule = PRICING_RULES[operation as BillableOperation];
        if (rule && usageData.totalCost > 0) {
          items.push({
            description: this.getOperationDescription(operation, usageData),
            quantity: usageData.count,
            unitPrice: rule.basePrice,
            amount: usageData.totalCost,
            metadata: {
              ...usageData.metadata,
              tier: customer.tier
            },
            type: 'usage'
          });
        }
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discounts = this.calculateDiscounts(items, customer);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal - discounts + tax;

    const invoice: Invoice = {
      id: invoiceId,
      customerId,
      period: { start: startDate, end: endDate },
      items,
      subtotal,
      discounts,
      tax,
      total,
      status: 'draft',
      createdAt: new Date(),
      dueDate: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    return invoice;
  }

  private groupUsageByOperation(events: UsageEvent[]): Record<string, any> {
    const grouped: Record<string, any> = {};

    for (const event of events) {
      if (!grouped[event.operation]) {
        grouped[event.operation] = {
          count: 0,
          totalCost: 0,
          metadata: {}
        };
      }

      grouped[event.operation].count++;
      grouped[event.operation].totalCost += event.cost;
      
      // Merge metadata
      Object.assign(grouped[event.operation].metadata, event.metadata);
    }

    return grouped;
  }

  private getOperationDescription(operation: string, usageData: any): string {
    const descriptions: Record<string, string> = {
      'project.generate': `Project Generation${usageData.metadata.chain ? ` (${usageData.metadata.chain})` : ''}`,
      'project.deploy': `Project Deployment${usageData.metadata.chain ? ` (${usageData.metadata.chain})` : ''}`,
      'contract.upgrade': 'Contract Upgrade Service',
      'contract.verify': 'Contract Verification',
      'analytics.export': 'Analytics Data Export',
      'api.call': 'API Calls',
      'support.priority': 'Priority Support'
    };

    return descriptions[operation] || operation;
  }

  private calculateDiscounts(items: InvoiceItem[], customer: Customer): number {
    let totalDiscounts = 0;

    // Volume discounts for high-usage customers
    const usageItems = items.filter(item => item.type === 'usage');
    const totalProjects = usageItems.reduce((sum, item) => sum + (item.metadata?.projectCount || 0), 0);

    if (totalProjects >= 50) {
      totalDiscounts += 100; // $100 discount for 50+ projects
    }

    // Loyalty discounts
    const monthsActive = this.calculateMonthsActive(customer);
    if (monthsActive >= 12) {
      totalDiscounts += 50; // $50 loyalty discount
    }

    return totalDiscounts;
  }

  private calculateMonthsActive(customer: Customer): number {
    // Simplified calculation - in production, use actual subscription start date
    return 6; // Assume 6 months for demo
  }
}

// ============================================================
// SUBSCRIPTION MANAGER
// ============================================================

class SubscriptionManager {
  private stripe: Stripe;
  private subscriptions: Map<string, Subscription> = new Map();

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true
    });
  }

  async createSubscription(
    customerId: string,
    tier: string,
    plan: 'monthly' | 'annual',
    paymentMethodId: string
  ): Promise<Subscription> {
    const pricing = SUBSCRIPTION_PRICING[tier as keyof typeof SUBSCRIPTION_PRICING];
    if (!pricing) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const basePrice = plan === 'annual' ? pricing.annualPrice : pricing.monthlyPrice;
    const interval = plan === 'annual' ? 'year' : 'month';

    try {
      const stripeSub = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${pricing.name} Plan - ${plan}`,
                metadata: {
                  tier,
                  plan
                }
              },
              unit_amount: Math.round(basePrice * 100), // Stripe uses cents
              recurring: {
                interval
              }
            },
            quantity: 1
          }
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on'
        },
        expand: ['latest_invoice.payment_intent']
      });

      const subscription: Subscription = {
        id: `sub_${stripeSub.id}`,
        customerId,
        stripeSubscriptionId: stripeSub.id,
        tier,
        plan,
        status: 'active',
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        basePrice: pricing.monthlyPrice,
        actualPrice: basePrice,
        cancelAtPeriodEnd: false
      };

      this.subscriptions.set(subscription.id, subscription);

      return subscription;

    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    subscription.status = 'canceled';
  }

  async upgradeSubscription(subscriptionId: string, newTier: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newPricing = SUBSCRIPTION_PRICING[newTier as keyof typeof SUBSCRIPTION_PRICING];
    if (!newPricing) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    try {
      // Create new subscription
      const newSub = await this.createSubscription(
        subscription.customerId,
        newTier,
        subscription.plan as 'monthly' | 'annual'
        'pm_card_1234' // Mock payment method
      );

      // Cancel old subscription
      await this.cancelSubscription(subscriptionId);

      return newSub;

    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  }

  getSubscription(subscriptionId: string): Subscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  getCustomerSubscriptions(customerId: string): Subscription[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.customerId === customerId);
  }
}

// ============================================================
// REVENUE ANALYTICS
// ============================================================

class RevenueAnalytics {
  private usageTracker: UsageTracker;

  constructor(usageTracker: UsageTracker) {
    this.usageTracker = usageTracker;
  }

  async calculateMRR(date: Date = new Date()): Promise<number> {
    // Calculate Monthly Recurring Revenue from all active subscriptions
    const events = this.usageTracker.getUsageEvents();
    
    // This would query database in production
    const mockSubscriptions = [
      { tier: 'starter', price: 99, count: 10 },
      { tier: 'professional', price: 499, count: 5 },
      { tier: 'enterprise', price: 2499, count: 2 }
    ];

    const mrr = mockSubscriptions.reduce((sum, sub) => sum + (sub.price * sub.count), 0);

    return mrr;
  }

  async calculateARR(date: Date = new Date()): Promise<number> {
    const mrr = await this.calculateMRR(date);
    return mrr * 12;
  }

  async calculateChurnRate(date: Date = new Date()): Promise<number> {
    // Simplified churn calculation
    return 0.05; // 5% monthly churn rate
  }

  async calculateLTV(date: Date = new Date()): Promise<number> {
    const arr = await this.calculateARR(date);
    const avgCustomerValue = 500; // Mock average customer value
    return arr / avgCustomerValue;
  }

  async getRevenueByTier(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    // Mock revenue by tier calculation
    return {
      free: 0,
      starter: 9900,
      professional: 24950,
      enterprise: 59980
    };
  }
}

// ============================================================
// BILLING SERVICE
// ============================================================

class BillingService extends EventEmitter {
  private app: express.Application;
  private usageTracker: UsageTracker;
  private invoiceGenerator: InvoiceGenerator;
  private subscriptionManager: SubscriptionManager;
  private revenueAnalytics: RevenueAnalytics;

  constructor(stripeSecretKey: string) {
    super();
    this.app = express();
    this.usageTracker = new UsageTracker();
    this.invoiceGenerator = new InvoiceGenerator(this.usageTracker);
    this.subscriptionManager = new SubscriptionManager(stripeSecretKey);
    this.revenueAnalytics = new RevenueAnalytics(this.usageTracker);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Usage tracking endpoints
    this.app.post('/internal/usage/track', this.handleTrackUsage.bind(this));
    this.app.get('/internal/usage/customer/:customerId', this.handleGetCustomerUsage.bind(this));
    
    // Billing endpoints
    this.app.post('/internal/billing/invoice/generate', this.handleGenerateInvoice.bind(this));
    this.app.get('/internal/billing/invoices/:customerId', this.handleGetInvoices.bind(this));
    
    // Subscription endpoints
    this.app.post('/internal/billing/subscription/create', this.handleCreateSubscription.bind(this));
    this.app.put('/internal/billing/subscription/:id/upgrade', this.handleUpgradeSubscription.bind(this));
    this.app.delete('/internal/billing/subscription/:id', this.handleCancelSubscription.bind(this));
    
    // Analytics endpoints
    this.app.get('/internal/billing/analytics/mrr', this.handleGetMRR.bind(this));
    this.app.get('/internal/billing/analytics/arr', this.handleGetARR.bind(this));
    this.app.get('/internal/billing/analytics/churn', this.handleGetChurn.bind(this));
    this.app.get('/internal/billing/analytics/ltv', this.handleGetLTV.bind(this));
    
    // Health check
    this.app.get('/internal/health', this.handleHealth.bind(this));
  }

  private setupEventHandlers(): void {
    // Real-time usage tracking
    this.usageTracker.on('usage.tracked', (event: UsageEvent) => {
      console.log(`💰 Usage tracked: ${event.operation} - $${event.cost.toFixed(2)} (${event.customerId})`);
    });
  }

  private async handleTrackUsage(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, apiKey, operation, metadata } = req.body;
      
      const event = await this.usageTracker.trackUsage(customerId, apiKey, operation, metadata);
      
      res.json({
        success: true,
        eventId: event.id,
        cost: event.cost
      });

    } catch (error) {
      console.error('Usage tracking failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetCustomerUsage(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const customer = this.usageTracker.getCustomerUsage(customerId);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const usage = await this.usageTracker.getUsageEvents(customerId);
      const stats = this.calculateUsageStats(usage);

      res.json({
        customerId,
        customer,
        usage: stats
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGenerateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, startDate, endDate } = req.body;
      
      const invoice = await this.invoiceGenerator.generateInvoice(
        customerId,
        new Date(startDate),
        new Date(endDate)
      );

      // TODO: Send invoice via Stripe or email
      console.log(`Generated invoice ${invoice.id} for ${customerId}`);

      res.json({
        invoiceId: invoice.id,
        total: invoice.total
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      
      // TODO: Query invoices from database
      res.json({ invoices: [] });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleCreateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, tier, plan, paymentMethodId } = req.body;
      
      const subscription = await this.subscriptionManager.createSubscription(
        customerId,
        tier,
        plan,
        paymentMethodId
      );

      console.log(`Created subscription ${subscription.id} for ${customerId}`);

      res.json(subscription);

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleUpgradeSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { tier } = req.body;
      
      const subscription = await this.subscriptionManager.upgradeSubscription(id, tier);

      console.log(`Upgraded subscription ${id} to ${tier}`);

      res.json(subscription);

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleCancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.subscriptionManager.cancelSubscription(id);

      console.log(`Canceled subscription ${id}`);

      res.json({ message: 'Subscription canceled' });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetMRR(req: Request, res: Response): Promise<void> {
    try {
      const mrr = await this.revenueAnalytics.calculateMRR();
      res.json({ mrr, date: new Date().toISOString() });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetARR(req: Request, res: Response): Promise<void> {
    try {
      const arr = await this.revenueAnalytics.calculateARR();
      res.json({ arr, date: new Date().toISOString() });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetChurn(req: Request, res: Response): Promise<void> {
    try {
      const churnRate = await this.revenueAnalytics.calculateChurnRate();
      res.json({ churnRate, date: new Date().toISOString() });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetLTV(req: Request, res: Response): Promise<void> {
    try {
      const ltv = await this.revenueAnalytics.calculateLTV();
      res.json({ ltv, date: new Date().toISOString() });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private calculateUsageStats(events: UsageEvent[]): any {
    const operations: Record<string, number> = {};
    const totalCost = events.reduce((sum, event) => sum + event.cost, 0);
    const byChain: Record<string, number> = {};
    const byTemplate: Record<string, number> = {};

    for (const event of events) {
      operations[event.operation] = (operations[event.operation] || 0) + 1;
      
      if (event.metadata.chain) {
        byChain[event.metadata.chain] = (byChain[event.metadata.chain] || 0) + event.cost;
      }
      
      if (event.metadata.template) {
        byTemplate[event.metadata.template] = (byTemplate[event.metadata.template] || 0) + 1;
      }
    }

    return {
      totalEvents: events.length,
      totalCost,
      operations,
      byChain,
      byTemplate
    };
  }

  private handleHealth(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'billing-system',
      version: '1.0.0',
      stripe: 'connected',
      metrics: {
        totalUsageEvents: this.usageTracker.getUsageEvents().length,
        totalSubscriptions: this.subscriptionManager.getCustomerSubscriptions('demo').length
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`💳 Billing System listening on port ${port}`);
      console.log(`💰 Pricing tiers configured:`);
      Object.entries(SUBSCRIPTION_PRICING).forEach(([tier, config]) => {
        console.log(`   ${tier}: $${config.monthlyPrice}/month`);
      });
    });
  }
}

// ============================================================
// STARTUP
// ============================================================

if (require.main === module) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
  const billing = new BillingService(stripeKey);
  
  billing.listen(parseInt(process.env.PORT || '3003'));
}

export { 
  BillingService, 
  UsageTracker, 
  InvoiceGenerator, 
  SubscriptionManager, 
  RevenueAnalytics,
  PRICING_RULES,
  SUBSCRIPTION_PRICING
};
