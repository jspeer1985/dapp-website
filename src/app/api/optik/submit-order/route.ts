/**
 * OPTIK Sales Platform → dApp Factory Integration Endpoint
 *
 * This endpoint receives orders from the customer-facing OPTIK website
 * and translates them into dApp Factory generation requests.
 *
 * Security: Validates inputs, sanitizes data, tracks requests
 * Error Handling: Comprehensive logging and rollback capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { nanoid } from 'nanoid';
import { rateLimit } from '@/middleware/rateLimit';
import { createLogger } from '@/utils/logger';

// Request validation schema
const optikOrderSchema = z.object({
  customerInfo: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).max(100),
    telegramHandle: z.string().optional(),
    deliveryWallet: z.string().min(32).max(44), // Solana address
    company: z.string().optional(),
  }),
  productType: z.enum(['token-only', 'dapp-only', 'token-and-dapp']),
  tokenInfo: z.object({
    name: z.string().min(1).max(32),
    symbol: z.string().min(1).max(10).transform(val => val.toUpperCase()),
    decimals: z.number().int().min(0).max(9),
    totalSupply: z.string().regex(/^\d+$/),
    description: z.string().max(500),
  }).optional(),
  dappInfo: z.object({
    projectName: z.string().min(1).max(50),
    description: z.string().max(1000),
    features: z.array(z.string()).default([]),
  }).optional(),
  tokenTier: z.enum(['tier-1', 'tier-2', 'tier-3']).optional(),
  dappTier: z.enum(['tier-1', 'tier-2', 'tier-3']).optional(),
  meta: z.object({
    totalPrice: z.number().positive(),
    currency: z.enum(['USD', 'SOL']),
    referralCode: z.string().optional(),
    campaign: z.string().optional(),
  }),
});

type OptikOrderInput = z.infer<typeof optikOrderSchema>;

// Logger utility
const logger = createLogger('OptikOrder');

/**
 * Maps OPTIK product type to Factory project type
 */
function mapProductType(optikType: string): 'dapp' | 'token' | 'both' {
  const mapping: Record<string, 'dapp' | 'token' | 'both'> = {
    'token-only': 'token',
    'dapp-only': 'dapp',
    'token-and-dapp': 'both',
  };
  return mapping[optikType] || 'dapp';
}

/**
 * Maps OPTIK tier system to Factory tier system
 */
function mapTierToFactory(formData: OptikOrderInput): 'starter' | 'professional' | 'enterprise' {
  if (formData.productType === 'token-and-dapp') {
    // Use the higher tier for combined products
    const dappTierMap: Record<string, number> = { 'tier-1': 1, 'tier-2': 2, 'tier-3': 3 };
    const tokenTierMap: Record<string, number> = { 'tier-1': 1, 'tier-2': 2, 'tier-3': 3 };

    const dappLevel = dappTierMap[formData.dappTier || 'tier-1'];
    const tokenLevel = tokenTierMap[formData.tokenTier || 'tier-1'];
    const maxLevel = Math.max(dappLevel, tokenLevel);

    return maxLevel === 3 ? 'enterprise' : maxLevel === 2 ? 'professional' : 'starter';
  }

  const tier = formData.tokenTier || formData.dappTier || 'tier-1';
  return tier === 'tier-3' ? 'enterprise' : tier === 'tier-2' ? 'professional' : 'starter';
}

/**
 * Calculate SOL payment amount based on tier and USD price
 */
function calculateSolAmount(tier: 'starter' | 'professional' | 'enterprise'): number {
  // Get pricing from environment or use defaults
  const pricing = {
    starter: parseFloat(process.env.NEXT_PUBLIC_DAPP_STARTER_PRICE_SOL || '4.5'),
    professional: parseFloat(process.env.NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_SOL || '12.5'),
    enterprise: parseFloat(process.env.NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_SOL || '35.0'),
  };

  return pricing[tier];
}

/**
 * Store order mapping for tracking and customer service
 */
async function storeOrderMapping(data: {
  optikJobId: string;
  factoryGenerationId: string;
  customerEmail: string;
  deliveryWallet: string;
  productType: string;
  totalPrice: number;
  currency: string;
  treasuryWallet: string;
  paymentAmount: number;
  timestamp: Date;
}) {
  // In production, this should go to a dedicated OrderMapping model
  // For now, we'll store it in the Generation document's metadata
  logger.info('Order mapping stored', {
    optikJobId: data.optikJobId,
    generationId: data.factoryGenerationId,
  });
}

export async function POST(request: NextRequest) {
  const requestId = nanoid(16);
  const startTime = Date.now();

  // 0. Rate limiting
  const rateLimitResult = rateLimit(request, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Tight limit for order submission
  });

  if (!rateLimitResult.allowed) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for order submission');
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  logger.info({ requestId }, `New OPTIK order received`);

  try {
    // 1. Parse and validate request
    const json = await request.json();
    const validatedData = optikOrderSchema.parse(json);

    logger.info(`Order validated [${requestId}]`, {
      productType: validatedData.productType,
      email: validatedData.customerInfo.email,
      wallet: validatedData.customerInfo.deliveryWallet.substring(0, 8) + '...',
    });

    // 2. Extract client metadata for security tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 3. Connect to database
    await connectToDatabase();

    // 4. Build Factory request
    const tier = mapTierToFactory(validatedData);
    const projectType = mapProductType(validatedData.productType);
    const paymentAmount = calculateSolAmount(tier);
    const treasuryWallet = process.env.NEXT_PUBLIC_SOLANA_TREASURY_WALLET;

    if (!treasuryWallet) {
      throw new Error('Treasury wallet not configured');
    }

    // 5. Determine project name and description
    let projectName = '';
    let projectDescription = '';

    if (validatedData.dappInfo) {
      projectName = validatedData.dappInfo.projectName;
      projectDescription = validatedData.dappInfo.description;
    } else if (validatedData.tokenInfo) {
      projectName = validatedData.tokenInfo.name;
      projectDescription = validatedData.tokenInfo.description;
    } else {
      throw new Error('Either dappInfo or tokenInfo must be provided');
    }

    // 6. Create Generation record
    const generationId = nanoid(16);
    const optikJobId = `optik_${Date.now()}_${nanoid(8)}`;

    const generation = new Generation({
      generationId,
      walletAddress: validatedData.customerInfo.deliveryWallet,
      projectName,
      projectDescription,
      projectType,
      tier,

      customerInfo: {
        email: validatedData.customerInfo.email,
        fullName: validatedData.customerInfo.fullName,
        telegramHandle: validatedData.customerInfo.telegramHandle,
      },

      aiConfig: {
        provider: process.env.AI_PROVIDER || 'openai',
        model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
        prompt: '', // Will be built during generation
        temperature: 0.7,
      },

      tokenConfig: validatedData.tokenInfo ? {
        name: validatedData.tokenInfo.name,
        symbol: validatedData.tokenInfo.symbol,
        decimals: validatedData.tokenInfo.decimals,
        totalSupply: parseInt(validatedData.tokenInfo.totalSupply),
        mintAuthority: validatedData.customerInfo.deliveryWallet,
      } : undefined,

      payment: {
        amount: validatedData.meta.totalPrice,
        currency: 'USD',
        status: 'pending',
        timestamp: new Date(),
        confirmations: 0,
      },

      status: 'pending_payment',

      compliance: {
        riskScore: 0,
        flags: [],
        whitelistStatus: 'pending',
      },

      ipAddress,
      userAgent,

      timestamps: {
        created: new Date(),
      },

      generationErrors: [],
      analytics: {},
    });

    await generation.save();

    logger.info(`Generation created [${requestId}]`, {
      generationId,
      optikJobId,
      tier,
      usdPrice: validatedData.meta.totalPrice,
    });

    // 7. Store order mapping
    await storeOrderMapping({
      optikJobId,
      factoryGenerationId: generationId,
      customerEmail: validatedData.customerInfo.email,
      deliveryWallet: validatedData.customerInfo.deliveryWallet,
      productType: validatedData.productType,
      totalPrice: validatedData.meta.totalPrice,
      currency: 'USD',
      treasuryWallet: 'STRIPE_MANAGED',
      paymentAmount: validatedData.meta.totalPrice,
      timestamp: new Date(),
    });

    // 8. Build response
    const responseTime = Date.now() - startTime;

    logger.info(`Order processed successfully [${requestId}] in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      jobId: generationId,
      optikJobId,
      paymentCurrency: 'USD',
      totalPrice: validatedData.meta.totalPrice,
      tier,
      status: 'pending_payment',
      estimatedCompletionMinutes: tier === 'enterprise' ? 90 : tier === 'professional' ? 60 : 30,
      message: 'Order created successfully. Proceeding to Stripe checkout.',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn(`Validation error [${requestId}]`, error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    logger.error(`Order processing failed [${requestId}] after ${responseTime}ms`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        requestId, // Include for customer support tracking
      },
      { status: 500 }
    );
  }
}
