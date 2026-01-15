import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

// --- Zod schema for input validation ---
const generationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  telegramHandle: z.string().optional(),
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  projectType: z.enum(['dapp', 'token', 'both']),
  tier: z.enum(['starter', 'professional', 'enterprise']),
  tokenConfig: z.object({
    name: z.string().min(1, "Token name is required"),
    symbol: z.string().min(1, "Token symbol is required"),
    decimals: z.number().int().min(0).max(18),
    totalSupply: z.number().int().positive(),
    logoUrl: z.string().url().optional(),
    isNFT: z.boolean(),
    nftCollectionName: z.string().optional(),
    royaltyPercentage: z.number().min(0).max(50),
  }).optional(),
  features: z.array(z.string().min(1)).optional(),
  metadata: z.object({
    primaryColor: z.string().optional(),
    targetAudience: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    discordUrl: z.string().url().optional(),
    telegramUrl: z.string().url().optional(),
    customRequirements: z.string().optional(),
  }).optional(),
});

// --- Helper to safely convert to BigInt ---
const safeBigInt = (value: string | number): bigint => {
  const n = Number(value);
  if (isNaN(n) || !Number.isInteger(n)) {
    throw new Error(`Invalid integer for BigInt conversion: ${value}`);
  }
  return BigInt(n);
};

// --- POST handler ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = generationSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Generate unique ID
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate payment amount based on tier
    const paymentAmount = parsed.tier === 'starter' ? 0.1 : parsed.tier === 'professional' ? 0.5 : 2.0;

    // Create new generation document
    const newGeneration = new Generation({
      generationId,
      walletAddress: parsed.walletAddress,
      projectName: parsed.projectName,
      projectDescription: parsed.projectDescription,
      projectType: parsed.projectType,
      tier: parsed.tier,
      customerInfo: {
        email: parsed.customerEmail,
        fullName: parsed.customerName,
        telegramHandle: parsed.telegramHandle,
      },
      aiConfig: {
        provider: 'openai',
        model: 'gpt-4',
        prompt: parsed.projectDescription,
        temperature: 0.7,
      },
      // Include token config if provided
      ...(parsed.tokenConfig && {
        tokenConfig: {
          name: parsed.tokenConfig.name,
          symbol: parsed.tokenConfig.symbol,
          decimals: parsed.tokenConfig.decimals,
          totalSupply: parsed.tokenConfig.totalSupply,
          mintAuthority: parsed.walletAddress,
        },
      }),
      payment: {
        amount: paymentAmount,
        currency: 'SOL',
        transactionSignature: '', // Will be set after payment
        status: 'pending',
        timestamp: new Date(),
        confirmations: 0,
      },
      status: 'pending_payment',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamps: {
        created: new Date(),
      },
    });

    // Save to database
    await newGeneration.save();

    return NextResponse.json({ 
      success: true, 
      generationId,
      paymentAmount,
    });
  } catch (err: any) {
    console.error('Generation creation error:', err);
    // Catch both Zod validation errors and other errors
    return NextResponse.json({
      success: false,
      error: err.message,
      details: err.errors || null
    }, { status: 400 });
  }
}
