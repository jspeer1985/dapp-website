// PRODUCTION API GATEWAY - Express.js Implementation
// This is the customer-facing entry point that protects your proprietary services

import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ============================================================
// TYPES & INTERFACES
// ============================================================

enum APIKeyTier {
  FREE = 'free',
  STARTER = 'starter', 
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

interface TierLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
  projectsPerMonth: number;
  templatesAllowed: string[];
  chainsAllowed: string[];
  features: string[];
  concurrentDeployments: number;
}

interface APIKey {
  id: string;
  key: string;
  tier: APIKeyTier;
  customerId: string;
  limits: TierLimits;
  metadata: {
    createdAt: Date;
    lastUsed?: Date;
    isActive: boolean;
    whiteLabel?: {
      domain: string;
      subdomain: string;
    };
  };
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// ============================================================
// CONFIGURATION
// ============================================================

const TIER_LIMITS: Record<APIKeyTier, TierLimits> = {
  [APIKeyTier.FREE]: {
    requestsPerMinute: 10,
    requestsPerDay: 100,
    projectsPerMonth: 3,
    templatesAllowed: ['basic_token', 'basic_sale'],
    chainsAllowed: ['polygon', 'arbitrum'],
    features: ['generation'],
    concurrentDeployments: 1
  },
  [APIKeyTier.STARTER]: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    projectsPerMonth: 10,
    templatesAllowed: ['basic_token', 'basic_sale', 'standard_launchpad'],
    chainsAllowed: ['ethereum', 'polygon', 'arbitrum', 'bsc'],
    features: ['generation', 'deployment', 'monitoring'],
    concurrentDeployments: 3
  },
  [APIKeyTier.PROFESSIONAL]: {
    requestsPerMinute: 300,
    requestsPerDay: 10000,
    projectsPerMonth: 50,
    templatesAllowed: ['*'], // All templates
    chainsAllowed: ['*'], // All chains
    features: ['generation', 'deployment', 'monitoring', 'analytics', 'upgrades'],
    concurrentDeployments: 10
  },
  [APIKeyTier.ENTERPRISE]: {
    requestsPerMinute: 1000,
    requestsPerDay: -1, // Unlimited
    projectsPerMonth: -1, // Unlimited
    templatesAllowed: ['*'],
    chainsAllowed: ['*'],
    features: ['*'], // All features including custom templates
    concurrentDeployments: -1 // Unlimited
  }
};

// ============================================================
// REDIS CLIENT
// ============================================================

class RedisClient {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await this.client.setex(key, expirySeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

// ============================================================
// API KEY MANAGER
// ============================================================

class APIKeyManager {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  generateAPIKey(tier: APIKeyTier): string {
    const prefix = {
      [APIKeyTier.FREE]: 'lpk_free',
      [APIKeyTier.STARTER]: 'lpk_start',
      [APIKeyTier.PROFESSIONAL]: 'lpk_pro',
      [APIKeyTier.ENTERPRISE]: 'lpk_ent'
    }[tier];

    const randomBytes = crypto.randomBytes(24).toString('base64url');
    return `${prefix}_${randomBytes}`;
  }

  async createAPIKey(customerId: string, tier: APIKeyTier, whiteLabel?: any): Promise<APIKey> {
    const key = this.generateAPIKey(tier);
    const apiKey: APIKey = {
      id: `key_${crypto.randomBytes(12).toString('hex')}`,
      key,
      tier,
      customerId,
      limits: TIER_LIMITS[tier],
      metadata: {
        createdAt: new Date(),
        isActive: true,
        whiteLabel
      }
    };

    await this.redis.set(`apikey:${key}`, JSON.stringify(apiKey));
    await this.redis.set(`customer:${customerId}:apikey`, key);

    return apiKey;
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    const data = await this.redis.get(`apikey:${key}`);
    if (!data) return null;

    const apiKey: APIKey = JSON.parse(data);
    
    if (!apiKey.metadata.isActive) {
      throw new Error('API key is inactive');
    }

    // Update last used timestamp
    apiKey.metadata.lastUsed = new Date();
    await this.redis.set(`apikey:${key}`, JSON.stringify(apiKey));

    return apiKey;
  }

  async revokeAPIKey(key: string): Promise<void> {
    const data = await this.redis.get(`apikey:${key}`);
    if (!data) throw new Error('API key not found');

    const apiKey: APIKey = JSON.parse(data);
    apiKey.metadata.isActive = false;
    await this.redis.set(`apikey:${key}`, JSON.stringify(apiKey));
  }
}

// ============================================================
// RATE LIMITER
// ============================================================

class RateLimiter {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async checkRateLimit(apiKey: APIKey, endpoint: string): Promise<RateLimitInfo> {
    const now = Date.now();
    const minuteKey = `ratelimit:${apiKey.key}:minute:${Math.floor(now / 60000)}`;
    const dayKey = `ratelimit:${apiKey.key}:day:${new Date().toISOString().split('T')[0]}`;

    // Increment counters
    const [minuteCount, dayCount] = await Promise.all([
      this.redis.incr(minuteKey),
      this.redis.incr(dayKey)
    ]);

    // Set expiry if first request in window
    if (minuteCount === 1) {
      await this.redis.expire(minuteKey, 60);
    }
    if (dayCount === 1) {
      await this.redis.expire(dayKey, 86400);
    }

    // Check limits
    const limits = apiKey.limits;
    const minuteLimit = limits.requestsPerMinute;
    const dayLimit = limits.requestsPerDay;

    if (minuteCount > minuteLimit) {
      const ttl = await this.redis.ttl(minuteKey);
      throw new RateLimitError('Rate limit exceeded (per minute)', {
        remaining: 0,
        reset: now + (ttl * 1000),
        limit: minuteLimit
      });
    }

    if (dayLimit > 0 && dayCount > dayLimit) {
      const ttl = await this.redis.ttl(dayKey);
      throw new RateLimitError('Rate limit exceeded (per day)', {
        remaining: 0,
        reset: now + (ttl * 1000),
        limit: dayLimit
      });
    }

    return {
      remaining: Math.min(
        minuteLimit - minuteCount,
        dayLimit > 0 ? dayLimit - dayCount : Infinity
      ),
      reset: now + 60000,
      limit: minuteLimit
    };
  }

  async checkMonthlyProjectLimit(apiKey: APIKey): Promise<void> {
    const monthKey = `projects:${apiKey.key}:month:${new Date().toISOString().slice(0, 7)}`;
    const count = parseInt(await this.redis.get(monthKey) || '0');

    const limit = apiKey.limits.projectsPerMonth;
    if (limit > 0 && count >= limit) {
      throw new Error(`Monthly project limit reached (${limit} projects)`);
    }
  }

  async incrementProjectCount(apiKey: APIKey): Promise<void> {
    const monthKey = `projects:${apiKey.key}:month:${new Date().toISOString().slice(0, 7)}`;
    await this.redis.incr(monthKey);
    await this.redis.expire(monthKey, 86400 * 31); // Expire after 31 days
  }
}

class RateLimitError extends Error {
  constructor(message: string, public info: RateLimitInfo) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ============================================================
// AUTHORIZATION SERVICE
// ============================================================

class AuthorizationService {
  
  validateTemplateAccess(apiKey: APIKey, template: string): void {
    const allowed = apiKey.limits.templatesAllowed;
    if (allowed.includes('*')) return;
    
    if (!allowed.includes(template)) {
      throw new Error(`Template '${template}' not available in ${apiKey.tier} tier`);
    }
  }

  validateChainAccess(apiKey: APIKey, chain: string): void {
    const allowed = apiKey.limits.chainsAllowed;
    if (allowed.includes('*')) return;
    
    if (!allowed.includes(chain)) {
      throw new Error(`Chain '${chain}' not available in ${apiKey.tier} tier`);
    }
  }

  validateFeatureAccess(apiKey: APIKey, feature: string): void {
    const allowed = apiKey.limits.features;
    if (allowed.includes('*')) return;
    
    if (!allowed.includes(feature)) {
      throw new Error(`Feature '${feature}' not available in ${apiKey.tier} tier`);
    }
  }

  async validateDeploymentCapacity(apiKey: APIKey, currentDeployments: number): Promise<void> {
    const limit = apiKey.limits.concurrentDeployments;
    if (limit < 0) return; // Unlimited
    
    if (currentDeployments >= limit) {
      throw new Error(`Concurrent deployment limit reached (${limit})`);
    }
  }
}

// ============================================================
// API GATEWAY
// ============================================================

class APIGateway {
  private app: express.Application;
  private redis: RedisClient;
  private apiKeyManager: APIKeyManager;
  private rateLimiter: RateLimiter;
  private authService: AuthorizationService;

  constructor() {
    this.app = express();
    this.redis = new RedisClient();
    this.apiKeyManager = new APIKeyManager(this.redis);
    this.rateLimiter = new RateLimiter(this.redis);
    this.authService = new AuthorizationService();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      next();
    });

    // Authentication middleware
    this.app.use(this.authenticateRequest.bind(this));
  }

  private async authenticateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip auth for health check and public endpoints
    if (req.path === '/health' || req.path === '/api/v1/auth/signup') {
      return next();
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const apiKey = authHeader.substring(7);
      const validatedKey = await this.apiKeyManager.validateAPIKey(apiKey);
      
      if (!validatedKey) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }

      // Check rate limits
      const rateLimitInfo = await this.rateLimiter.checkRateLimit(validatedKey, req.path);

      // Attach to request
      (req as any).apiKey = validatedKey;
      (req as any).rateLimitInfo = rateLimitInfo;

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.reset).toISOString());

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({
          error: error.message,
          rateLimit: error.info
        });
      } else {
        res.status(401).json({ error: (error as Error).message });
      }
    }
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Key management
    this.app.post('/api/v1/auth/keys', async (req, res) => {
      try {
        const { customerId, tier, whiteLabel } = req.body;
        const apiKey = await this.apiKeyManager.createAPIKey(customerId, tier, whiteLabel);
        res.json({ apiKey: apiKey.key, tier: apiKey.tier });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Project generation
    this.app.post('/api/v1/projects/generate', this.handleGeneration.bind(this));
    
    // Project deployment
    this.app.post('/api/v1/projects/:id/deploy', this.handleDeployment.bind(this));
    
    // Billing and usage
    this.app.get('/api/v1/billing/usage', this.handleBilling.bind(this));
    
    // Artifact retrieval
    this.app.get('/api/v1/projects/:id/artifacts', this.handleArtifacts.bind(this));
  }

  private async handleGeneration(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = (req as any).apiKey as APIKey;
      const { template, config, chain } = req.body;

      // Validate access
      this.authService.validateTemplateAccess(apiKey, template);
      this.authService.validateChainAccess(apiKey, chain);
      this.authService.validateFeatureAccess(apiKey, 'generation');

      // Check monthly limit
      await this.rateLimiter.checkMonthlyProjectLimit(apiKey);

      // Generate project ID
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Increment project count
      await this.rateLimiter.incrementProjectCount(apiKey);

      // Forward to proprietary generation service
      const generationServiceURL = process.env.GENERATION_SERVICE_URL || 'http://localhost:3001';
      
      console.log(`🔧 Forwarding generation request to: ${generationServiceURL}`);
      console.log(`📋 Project: ${projectId}, Template: ${template}, Tier: ${apiKey.tier}`);

      res.json({
        projectId,
        status: 'generating',
        estimatedTime: this.calculateEstimatedTime(apiKey.tier),
        message: 'Request queued for generation',
        generationServiceURL
      });

    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  private async handleDeployment(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = (req as any).apiKey as APIKey;
      this.authService.validateFeatureAccess(apiKey, 'deployment');
      
      const deploymentId = `dep_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      res.json({
        deploymentId,
        status: 'queued',
        message: 'Deployment request queued'
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  private async handleBilling(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = (req as any).apiKey as APIKey;
      
      res.json({
        customerId: apiKey.customerId,
        tier: apiKey.tier,
        limits: apiKey.limits,
        usage: {
          requestsThisMinute: 0, // Would be calculated from Redis
          requestsToday: 0,
          projectsThisMonth: 0
        }
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  private async handleArtifacts(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = (req as any).apiKey as APIKey;
      const projectId = req.params.id;
      
      // In production, this would retrieve from storage
      res.json({
        projectId,
        status: 'completed',
        artifacts: {
          contracts: [
            {
              name: 'Token.sol',
              bytecode: '0x608060...',
              abi: [],
              source: '// Generated contract code'
            }
          ],
          frontend: {
            components: ['TokenWidget.tsx', 'SaleDashboard.tsx'],
            build: 'frontend.zip'
          },
          deploymentKey: `dk_${projectId}_${Date.now()}`
        }
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  private calculateEstimatedTime(tier: APIKeyTier): string {
    const times = {
      [APIKeyTier.FREE]: '60 seconds',
      [APIKeyTier.STARTER]: '45 seconds',
      [APIKeyTier.PROFESSIONAL]: '30 seconds',
      [APIKeyTier.ENTERPRISE]: '15 seconds'
    };

    return times[tier] || '45 seconds';
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 API Gateway listening on port ${port}`);
      console.log(`📊 Tier Limits Configured:`);
      Object.entries(TIER_LIMITS).forEach(([tier, limits]) => {
        console.log(`   ${tier}: ${limits.projectsPerMonth} projects/month, ${limits.requestsPerMinute} req/min`);
      });
    });
  }
}

// ============================================================
// STARTUP
// ============================================================

if (require.main === module) {
  const gateway = new APIGateway();
  gateway.listen(parseInt(process.env.PORT || '3000'));
}

export { APIGateway, APIKeyManager, RateLimiter, AuthorizationService, APIKeyTier, TierLimits };
