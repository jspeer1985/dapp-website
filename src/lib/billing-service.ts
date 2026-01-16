// BILLING SERVICE - Revenue tracking and usage analytics
// This service handles all financial aspects of your platform

import express, { Request, Response } from 'express';
import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface UsageEvent {
  id: string;
  customerId: string;
  apiKey: string;
  operation: string;
  cost: number;
  currency: string;
  timestamp: Date;
  metadata: {
    projectId?: string;
    template?: string;
    chain?: string;
    deploymentId?: string;
    tier?: string;
  };
  status: 'pending' | 'completed' | 'failed';
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  activeCustomers: number;
  totalOperations: number;
  operationsByType: Record<string, number>;
  revenueByTier: Record<string, number>;
  topCustomers: Array<{
    customerId: string;
    revenue: number;
    operations: number;
  }>;
}

interface Customer {
  id: string;
  apiKey: string;
  tier: string;
  limits: {
    projectsPerMonth: number;
    requestsPerDay: number;
    requestsPerMinute: number;
  };
  billing: {
    plan: string;
    monthlyFee: number;
    currency: string;
    nextBillingDate: Date;
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
  };
  usage: {
    projectsThisMonth: number;
    requestsToday: number;
    requestsThisMinute: number;
    totalSpent: number;
  };
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
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'subscription' | 'usage' | 'overage';
}

// ============================================================
// PRICING CONFIGURATION
// ============================================================

class PricingConfig {
  private static readonly TIERS = {
    free: {
      name: 'Free',
      monthlyFee: 0,
      currency: 'USD',
      features: ['basic_generation', 'community_support'],
      limits: {
        projectsPerMonth: 3,
        requestsPerDay: 100,
        requestsPerMinute: 10,
        concurrentDeployments: 1
      }
    },
    starter: {
      name: 'Starter',
      monthlyFee: 99,
      currency: 'USD',
      features: ['standard_generation', 'email_support', 'basic_analytics'],
      limits: {
        projectsPerMonth: 10,
        requestsPerDay: 1000,
        requestsPerMinute: 60,
        concurrentDeployments: 3
      }
    },
    professional: {
      name: 'Professional',
      monthlyFee: 499,
      currency: 'USD',
      features: ['advanced_generation', 'priority_support', 'advanced_analytics', 'custom_templates'],
      limits: {
        projectsPerMonth: 50,
        requestsPerDay: 10000,
        requestsPerMinute: 300,
        concurrentDeployments: 10
      }
    },
    enterprise: {
      name: 'Enterprise',
      monthlyFee: 2499,
      currency: 'USD',
      features: ['unlimited_generation', 'dedicated_support', 'white_label', 'custom_integrations'],
      limits: {
        projectsPerMonth: -1, // Unlimited
        requestsPerDay: -1,
        requestsPerMinute: 1000,
        concurrentDeployments: -1
      }
    }
  };

  private static readonly OPERATION_COSTS = {
    'project.generate': {
      baseCost: 10.00,
      description: 'Project generation'
    },
    'project.deploy': {
      baseCost: 25.00,
      description: 'Managed deployment'
    },
    'contract.upgrade': {
      baseCost: 15.00,
      description: 'Contract upgrade service'
    },
    'analytics.export': {
      baseCost: 5.00,
      description: 'Analytics data export'
    },
    'support.priority': {
      baseCost: 50.00,
      description: 'Priority support ticket'
    },
    'template.custom': {
      baseCost: 500.00,
      description: 'Custom template development'
    }
  };

  private static readonly CHAIN_MULTIPLIERS = {
    ethereum: 1.5,
    polygon: 1.0,
    arbitrum: 1.2,
    bsc: 1.1,
    solana: 1.3,
    base: 1.0,
    avalanche: 1.1
  };

  static getTierConfig(tier: string) {
    return this.TIERS[tier.toLowerCase()] || this.TIERS.free;
  }

  static getOperationCost(operation: string, chain?: string): number {
    const cost = this.OPERATION_COSTS[operation];
    if (!cost) return 0;

    const multiplier = chain ? this.CHAIN_MULTIPLIERS[chain.toLowerCase()] || 1.0 : 1.0;
    return cost.baseCost * multiplier;
  }

  static calculateOverage(usage: number, limit: number, costPerUnit: number): number {
    if (limit < 0) return 0; // Unlimited
    const overage = Math.max(0, usage - limit);
    return overage * costPerUnit;
  }
}

// ============================================================
// BILLING SERVICE
// ============================================================

class BillingService extends EventEmitter {
  private app: express.Application;
  private usageEvents: Map<string, UsageEvent> = new Map();
  private customers: Map<string, Customer> = new Map();
  private invoices: Map<string, Invoice> = new Map();

  constructor() {
    super();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Track usage events
    this.app.post('/internal/usage', this.trackUsage.bind(this));
    
    // Customer billing info
    this.app.get('/internal/customers/:customerId', this.getCustomer.bind(this));
    this.app.get('/internal/customers/:customerId/usage', this.getCustomerUsage.bind(this));
    
    // Invoices
    this.app.get('/internal/invoices/:customerId', this.getCustomerInvoices.bind(this));
    this.app.post('/internal/invoices/:customerId/generate', this.generateInvoice.bind(this));
    
    // Metrics and analytics
    this.app.get('/internal/metrics', this.getBillingMetrics.bind(this));
    this.app.get('/internal/metrics/revenue', this.getRevenueMetrics.bind(this));
    
    // Health check
    this.app.get('/internal/health', this.handleHealth.bind(this));
  }

  // ============================================================
  // USAGE TRACKING
  // ============================================================

  private async trackUsage(req: Request, res: Response): Promise<void> {
    try {
      const usageData: Omit<UsageEvent, 'id' | 'timestamp' | 'status'> = req.body;
      
      const usageEvent: UsageEvent = {
        id: `usage_${crypto.randomBytes(8).toString('hex')}`,
        timestamp: new Date(),
        status: 'pending',
        ...usageData
      };

      // Calculate cost
      usageEvent.cost = PricingConfig.getOperationCost(
        usageEvent.operation,
        usageEvent.metadata.chain
      );

      // Store usage event
      this.usageEvents.set(usageEvent.id, usageEvent);

      // Update customer usage
      await this.updateCustomerUsage(usageEvent);

      // Emit for real-time tracking
      this.emit('usage.tracked', usageEvent);

      console.log(`💰 Usage tracked: ${usageEvent.operation} - $${usageEvent.cost.toFixed(2)} for ${usageEvent.customerId}`);

      res.json({
        success: true,
        usageId: usageEvent.id,
        cost: usageEvent.cost,
        currency: usageEvent.currency
      });

    } catch (error) {
      console.error('Usage tracking failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async updateCustomerUsage(event: UsageEvent): Promise<void> {
    let customer = this.customers.get(event.customerId);
    
    if (!customer) {
      // Load customer from database (simplified)
      customer = await this.loadCustomer(event.customerId);
      if (customer) {
        this.customers.set(event.customerId, customer);
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

    // Mark event as completed
    event.status = 'completed';
    this.usageEvents.set(event.id, event);
  }

  // ============================================================
  // CUSTOMER MANAGEMENT
  // ============================================================

  private async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      
      let customer = this.customers.get(customerId);
      if (!customer) {
        customer = await this.loadCustomer(customerId);
        if (customer) {
          this.customers.set(customerId, customer);
        }
      }

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({
        id: customer.id,
        tier: customer.tier,
        billing: customer.billing,
        usage: customer.usage,
        limits: customer.limits
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async getCustomerUsage(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { period = 'current' } = req.query;
      
      const customer = this.customers.get(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Get detailed usage breakdown
      const usage = await this.getDetailedUsage(customerId, period as string);

      res.json({
        customerId,
        period,
        usage,
        costs: {
          current: customer.usage.totalSpent,
          monthly: customer.billing.monthlyFee,
          projected: this.calculateProjectedMonthlyCost(customer)
        }
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async getDetailedUsage(customerId: string, period: string): Promise<any> {
    // In production, query database for detailed usage
    const customer = this.customers.get(customerId);
    if (!customer) return null;

    // Get usage events for this customer
    const customerEvents = Array.from(this.usageEvents.values())
      .filter(event => event.customerId === customerId);

    // Group by operation type
    const operationsByType: Record<string, number> = {};
    const operationsByChain: Record<string, number> = {};
    let totalCost = 0;

    for (const event of customerEvents) {
      operationsByType[event.operation] = (operationsByType[event.operation] || 0) + 1;
      operationsByChain[event.metadata.chain || 'unknown'] = (operationsByChain[event.metadata.chain || 'unknown'] || 0) + 1;
      totalCost += event.cost;
    }

    return {
      totalEvents: customerEvents.length,
      totalCost,
      operationsByType,
      operationsByChain,
      period
    };
  }

  private calculateProjectedMonthlyCost(customer: Customer): number {
    const tier = PricingConfig.getTierConfig(customer.tier);
    let projected = tier.monthlyFee;

    // Add overages
    if (customer.usage.projectsThisMonth > tier.limits.projectsPerMonth && tier.limits.projectsPerMonth > 0) {
      const projectOverage = customer.usage.projectsThisMonth - tier.limits.projectsPerMonth;
      projected += projectOverage * PricingConfig.getOperationCost('project.generate');
    }

    if (customer.usage.requestsToday > tier.limits.requestsPerDay && tier.limits.requestsPerDay > 0) {
      const requestOverage = customer.usage.requestsToday - tier.limits.requestsPerDay;
      projected += requestOverage * 0.01; // $0.01 per extra request
    }

    return projected;
  }

  // ============================================================
  // INVOICE GENERATION
  // ============================================================

  private async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { period = 'current' } = req.query;
      
      const customer = this.customers.get(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const invoice = await this.createInvoice(customer, period as string);
      this.invoices.set(invoice.id, invoice);

      res.json({
        invoice,
        downloadUrl: `/internal/invoices/${customerId}/${invoice.id}/download`
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async createInvoice(customer: Customer, period: string): Promise<Invoice> {
    const tier = PricingConfig.getTierConfig(customer.tier);
    const now = new Date();
    
    // Calculate period dates
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const items: InvoiceItem[] = [];

    // Subscription fee
    items.push({
      description: `${tier.name} Plan - ${period}`,
      quantity: 1,
      unitPrice: tier.monthlyFee,
      amount: tier.monthlyFee,
      type: 'subscription'
    });

    // Usage overages
    const overages = this.calculateOverages(customer, tier);
    items.push(...overages);

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return {
      id: `inv_${crypto.randomBytes(8).toString('hex')}`,
      customerId: customer.id,
      period: {
        start: periodStart,
        end: periodEnd
      },
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      createdAt: now,
      dueDate: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days after period end
    };
  }

  private calculateOverages(customer: Customer, tier: any): InvoiceItem[] {
    const overages: InvoiceItem[] = [];

    // Project overages
    if (customer.usage.projectsThisMonth > tier.limits.projectsPerMonth && tier.limits.projectsPerMonth > 0) {
      const overageProjects = customer.usage.projectsThisMonth - tier.limits.projectsPerMonth;
      const overageCost = overageProjects * PricingConfig.getOperationCost('project.generate');
      
      overages.push({
        description: `Project generation overage (${overageProjects} extra projects)`,
        quantity: overageProjects,
        unitPrice: PricingConfig.getOperationCost('project.generate'),
        amount: overageCost,
        type: 'overage'
      });
    }

    // Request overages
    if (customer.usage.requestsToday > tier.limits.requestsPerDay && tier.limits.requestsPerDay > 0) {
      const overageRequests = customer.usage.requestsToday - tier.limits.requestsPerDay;
      const overageCost = overageRequests * 0.01;
      
      overages.push({
        description: `API request overage (${overageRequests} extra requests)`,
        quantity: overageRequests,
        unitPrice: 0.01,
        amount: overageCost,
        type: 'overage'
      });
    }

    return overages;
  }

  // ============================================================
  // METRICS AND ANALYTICS
  // ============================================================

  private async getBillingMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.calculateBillingMetrics();
      
      res.json({
        timestamp: new Date().toISOString(),
        metrics,
        period: 'current_month'
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async getRevenueMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'current' } = req.query;
      const revenue = await this.calculateRevenueMetrics(period as string);
      
      res.json({
        timestamp: new Date().toISOString(),
        period,
        revenue,
        growth: await this.calculateGrowthRates(period as string)
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async calculateBillingMetrics(): Promise<BillingMetrics> {
    const events = Array.from(this.usageEvents.values());
    const customers = Array.from(this.customers.values());

    // Calculate totals
    const totalRevenue = events
      .filter(e => e.status === 'completed')
      .reduce((sum, e) => sum + e.cost, 0);

    const monthlyRevenue = events
      .filter(e => e.status === 'completed' && 
                    e.timestamp.getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + e.cost, 0);

    // Operations by type
    const operationsByType: Record<string, number> = {};
    events.forEach(e => {
      operationsByType[e.operation] = (operationsByType[e.operation] || 0) + 1;
    });

    // Revenue by tier
    const revenueByTier: Record<string, number> = {};
    customers.forEach(customer => {
      const customerEvents = events.filter(e => e.customerId === customer.id);
      const customerRevenue = customerEvents.reduce((sum, e) => sum + e.cost, 0);
      revenueByTier[customer.tier] = (revenueByTier[customer.tier] || 0) + customerRevenue;
    });

    // Top customers
    const customerRevenue: Record<string, { revenue: number; operations: number }> = {};
    customers.forEach(customer => {
      const customerEvents = events.filter(e => e.customerId === customer.id);
      customerRevenue[customer.id] = {
        revenue: customerEvents.reduce((sum, e) => sum + e.cost, 0),
        operations: customerEvents.length
      };
    });

    const topCustomers = Object.entries(customerRevenue)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([customerId, data]) => ({ customerId, ...data }));

    return {
      totalRevenue,
      monthlyRevenue,
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.billing.status === 'active').length,
      totalOperations: events.length,
      operationsByType,
      revenueByTier,
      topCustomers
    };
  }

  private async calculateRevenueMetrics(period: string): Promise<any> {
    const events = Array.from(this.usageEvents.values());
    const now = new Date();
    
    // Filter events by period
    const periodEvents = events.filter(e => {
      if (period === 'current') {
        return e.timestamp.getMonth() === now.getMonth() && 
               e.timestamp.getFullYear() === now.getFullYear();
      }
      return true; // For 'all' period
    });

    // Daily revenue for the last 30 days
    const dailyRevenue: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyRevenue[dateStr] = periodEvents
        .filter(e => e.timestamp.toDateString() === date.toDateString())
        .reduce((sum, e) => sum + e.cost, 0);
    }

    // Revenue by operation type
    const revenueByOperation: Record<string, number> = {};
    periodEvents.forEach(e => {
      revenueByOperation[e.operation] = (revenueByOperation[e.operation] || 0) + e.cost;
    });

    return {
      total: periodEvents.reduce((sum, e) => sum + e.cost, 0),
      daily: dailyRevenue,
      byOperation: revenueByOperation,
      averageTransactionValue: periodEvents.length > 0 ? 
        periodEvents.reduce((sum, e) => sum + e.cost, 0) / periodEvents.length : 0
    };
  }

  private async calculateGrowthRates(period: string): Promise<any> {
    // Calculate month-over-month growth
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const events = Array.from(this.usageEvents.values());
    
    const currentRevenue = events
      .filter(e => e.timestamp.getMonth() === currentMonth)
      .reduce((sum, e) => sum + e.cost, 0);
    
    const lastRevenue = events
      .filter(e => e.timestamp.getMonth() === lastMonth)
      .reduce((sum, e) => sum + e.cost, 0);

    const growthRate = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return {
      monthOverMonth: growthRate,
      currentMonthRevenue: currentRevenue,
      lastMonthRevenue: lastRevenue
    };
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  private async loadCustomer(customerId: string): Promise<Customer | null> {
    // In production, load from database
    // For demo, return mock customer
    return {
      id: customerId,
      apiKey: `lpk_${crypto.randomBytes(16).toString('hex')}`,
      tier: 'starter',
      limits: {
        projectsPerMonth: 10,
        requestsPerDay: 1000,
        requestsPerMinute: 60
      },
      billing: {
        plan: 'Starter',
        monthlyFee: 99,
        currency: 'USD',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      usage: {
        projectsThisMonth: 0,
        requestsToday: 0,
        requestsThisMinute: 0,
        totalSpent: 0
      }
    };
  }

  private handleHealth(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'billing',
      version: '1.0.0',
      metrics: {
        totalUsageEvents: this.usageEvents.size,
        totalCustomers: this.customers.size,
        totalInvoices: this.invoices.size
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`💰 Billing Service listening on port ${port}`);
      console.log(`📊 Pricing tiers configured:`);
      Object.entries(PricingConfig.TIERS).forEach(([tier, config]) => {
        console.log(`   ${tier}: $${config.monthlyFee}/month`);
      });
    });
  }
}

// ============================================================
// STARTUP
// ============================================================

if (require.main === module) {
  const billingService = new BillingService();
  
  billingService.on('usage.tracked', (event) => {
    console.log(`💰 Usage tracked: ${event.operation} - $${event.cost.toFixed(2)} (${event.customerId})`);
  });

  billingService.listen(parseInt(process.env.PORT || '3003'));
}

export { BillingService, PricingConfig };
