// API GATEWAY - CONTROLS ACCESS TO PROPRIETARY GENERATOR
// This is the customer-facing layer that protects your moat

import { NextRequest, NextResponse } from 'next/server';
import { GenerationRequest, GenerationResponse, ArtifactResponse, APIKeyTier, TierLimits } from '@/types/generator';
import { GeneratorService } from './generator-service';

export class APIGateway {
  private generator: GeneratorService;
  private rateLimiter: RateLimiter;
  private authManager: AuthManager;
  private billingService: BillingService;

  constructor() {
    this.generator = new GeneratorService();
    this.rateLimiter = new RateLimiter();
    this.authManager = new AuthManager();
    this.billingService = new BillingService();
  }

  /**
   * Main project generation endpoint
   * POST /api/v1/projects/generate
   */
  async handleGenerationRequest(request: NextRequest): Promise<NextResponse> {
    try {
      // STEP 1: Authenticate and authorize
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      const { apiKey, customer } = authResult;

      // STEP 2: Validate rate limits
      const rateLimitResult = await this.rateLimiter.checkLimit(apiKey);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            resetTime: rateLimitResult.resetTime,
            limit: rateLimitResult.limit
          },
          { status: 429 }
        );
      }

      // STEP 3: Parse and validate request
      const body = await request.json();
      const validationResult = await this.validateGenerationRequest(body, customer.tier);
      if (!validationResult.valid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        );
      }

      const generationRequest: GenerationRequest = validationResult.data;

      // STEP 4: Track usage for billing
      await this.billingService.trackUsage(apiKey, 'project.generate', {
        projectId: generationRequest.config.projectId,
        template: generationRequest.template,
        chain: generationRequest.chain
      });

      // STEP 5: Queue generation (async)
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Start generation in background
      this.generator.generateProject(generationRequest.config)
        .then(artifacts => this.handleGenerationComplete(projectId, artifacts, customer))
        .catch(error => this.handleGenerationError(projectId, error, customer));

      // STEP 6: Return immediate response
      const response: GenerationResponse = {
        projectId,
        status: 'generating',
        estimatedTime: this.calculateEstimatedTime(generationRequest.tier),
        webhookUrl: body.webhookUrl
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('Generation request failed:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Artifact delivery endpoint
   * GET /api/v1/projects/{projectId}/artifacts
   */
  async handleArtifactRequest(request: NextRequest, projectId: string): Promise<NextResponse> {
    try {
      // Authenticate
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      // Check if project belongs to customer
      const hasAccess = await this.checkProjectAccess(authResult.customer.id, projectId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Retrieve artifacts
      const artifacts = await this.getArtifacts(projectId);
      if (!artifacts) {
        return NextResponse.json(
          { error: 'Artifacts not ready' },
          { status: 404 }
        );
      }

      // Track artifact access
      await this.billingService.trackUsage(authResult.apiKey, 'project.artifacts', {
        projectId
      });

      const response: ArtifactResponse = {
        projectId,
        status: 'completed',
        artifacts,
        deploymentKey: artifacts.deploymentKey,
        updateAvailable: false
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('Artifact request failed:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * Managed deployment endpoint
   * POST /api/v1/projects/{projectId}/deploy
   */
  async handleDeploymentRequest(request: NextRequest, projectId: string): Promise<NextResponse> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      const body = await request.json();
      const deploymentId = `dep_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Track deployment usage
      await this.billingService.trackUsage(authResult.apiKey, 'project.deploy', {
        projectId,
        deploymentId
      });

      // Start deployment in background
      this.startDeployment(projectId, deploymentId, body, authResult.customer);

      return NextResponse.json({
        deploymentId,
        status: 'deploying',
        progress: {
          contracts: 'pending',
          frontend: 'pending',
          dns: 'pending'
        },
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes
      });

    } catch (error) {
      console.error('Deployment request failed:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async authenticateRequest(request: NextRequest): Promise<AuthResult> {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return { success: false, error: 'API key required', status: 401 };
    }

    const customer = await this.authManager.validateAPIKey(apiKey);
    if (!customer) {
      return { success: false, error: 'Invalid API key', status: 401 };
    }

    return { success: true, apiKey, customer };
  }

  private async validateGenerationRequest(body: any, tier: string): Promise<ValidationResult> {
    const required = ['template', 'config', 'chain', 'tier'];
    for (const field of required) {
      if (!body[field]) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate template access for tier
    const tierLimits = this.getTierLimits(tier);
    if (!tierLimits.templates.includes(body.template)) {
      return { 
        valid: false, 
        error: `Template '${body.template}' not available in ${tier} tier` 
      };
    }

    return { valid: true, data: body as GenerationRequest };
  }

  private getTierLimits(tier: string): TierLimits {
    const limits = {
      free: {
        projects: 3,
        templates: ['basic_token', 'simple_dapp'],
        features: ['basic'],
        support: 'community'
      },
      starter: {
        projects: 10,
        templates: ['basic_token', 'simple_dapp', 'vesting'],
        features: ['basic', 'vesting'],
        support: 'email'
      },
      pro: {
        projects: 50,
        templates: ['all'],
        features: ['basic', 'vesting', 'staking', 'dao'],
        support: 'priority'
      },
      enterprise: {
        projects: -1, // unlimited
        templates: ['all', 'custom'],
        features: ['all'],
        support: 'dedicated'
      }
    };

    return limits[tier] || limits.free;
  }

  private calculateEstimatedTime(tier: string): string {
    const times = {
      basic: '30 seconds',
      advanced: '45 seconds',
      enterprise: '60 seconds'
    };

    return times[tier] || '45 seconds';
  }

  private async handleGenerationComplete(projectId: string, artifacts: any, customer: any): Promise<void> {
    // Store artifacts
    await this.storeArtifacts(projectId, artifacts);
    
    // Send webhook if provided
    if (customer.webhookUrl) {
      await this.sendWebhook(customer.webhookUrl, {
        event: 'generation.completed',
        projectId,
        artifacts
      });
    }

    console.log(`✅ Generation completed: ${projectId}`);
  }

  private async handleGenerationError(projectId: string, error: any, customer: any): Promise<void> {
    console.error(`❌ Generation failed: ${projectId}`, error);
    
    if (customer.webhookUrl) {
      await this.sendWebhook(customer.webhookUrl, {
        event: 'generation.failed',
        projectId,
        error: error.message
      });
    }
  }

  private async startDeployment(projectId: string, deploymentId: string, config: any, customer: any): Promise<void> {
    // Implementation would deploy contracts and frontend
    console.log(`🚀 Starting deployment: ${deploymentId}`);
    
    // Simulate deployment process
    setTimeout(async () => {
      const deploymentResult = {
        deploymentId,
        contracts: {
          'Token': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          'Vesting': '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
        },
        frontendUrl: `https://${config.customDomain || `${projectId}.launchpad.app`}`,
        explorerLinks: [`https://etherscan.io/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1`]
      };

      if (customer.webhookUrl) {
        await this.sendWebhook(customer.webhookUrl, {
          event: 'deployment.completed',
          ...deploymentResult
        });
      }
    }, 300000); // 5 minutes
  }

  private async sendWebhook(url: string, data: any): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }

  private async storeArtifacts(projectId: string, artifacts: any): Promise<void> {
    // Store in database or file system
    // Implementation depends on your storage choice
    console.log(`Storing artifacts for ${projectId}`);
  }

  private async getArtifacts(projectId: string): Promise<any> {
    // Retrieve stored artifacts
    // Implementation depends on your storage choice
    return null;
  }

  private async checkProjectAccess(customerId: string, projectId: string): Promise<boolean> {
    // Check if project belongs to customer
    return true; // Simplified for demo
  }
}

// ==================== SUPPORTING CLASSES ====================

class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();

  async checkLimit(apiKey: string): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.limits.get(apiKey);
    
    if (!current || now > current.resetTime) {
      this.limits.set(apiKey, { count: 1, resetTime: now + 86400000 }); // 24 hours
      return { allowed: true, limit: 10, remaining: 9 };
    }

    if (current.count >= 10) {
      return { 
        allowed: false, 
        limit: 10, 
        remaining: 0,
        resetTime: current.resetTime 
      };
    }

    current.count++;
    return { 
      allowed: true, 
      limit: 10, 
      remaining: 10 - current.count 
    };
  }
}

class AuthManager {
  async validateAPIKey(apiKey: string): Promise<any> {
    // Validate API key against database
    // Return customer info including tier and limits
    
    // Demo implementation
    if (apiKey.startsWith('sk_demo_')) {
      return {
        id: 'cust_demo',
        tier: 'starter',
        limits: { projects: 10, templates: ['basic'] }
      };
    }
    
    return null;
  }
}

class BillingService {
  async trackUsage(apiKey: string, operation: string, metadata: any): Promise<void> {
    const cost = this.calculateCost(operation, metadata);
    
    console.log(`💰 Billing: ${operation} - $${cost.toFixed(2)} for ${apiKey}`);
    
    // Store usage event for billing
    // Implementation would connect to your billing system
  }

  private calculateCost(operation: string, metadata: any): number {
    const baseCost = {
      'project.generate': 10.00,
      'project.artifacts': 0.00,
      'project.deploy': 25.00,
      'contract.upgrade': 15.00,
      'analytics.export': 5.00
    };

    const chainMultiplier = {
      'ethereum': 1.5,
      'polygon': 1.0,
      'arbitrum': 1.2,
      'solana': 1.3
    };

    const base = baseCost[operation] || 0;
    const multiplier = chainMultiplier[metadata.chain] || 1.0;
    
    return base * multiplier;
  }
}

// ==================== TYPE DEFINITIONS ====================

interface AuthResult {
  success: boolean;
  apiKey?: string;
  customer?: any;
  error?: string;
  status?: number;
}

interface ValidationResult {
  valid: boolean;
  data?: GenerationRequest;
  error?: string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime?: number;
}

export { APIGateway };
