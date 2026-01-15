# OPTIK → dApp Factory Integration Guide

## Overview

Your OPTIK website (customer-facing) will send orders to your dApp Factory backend (the tested system) running at `http://localhost:3003` (or your production domain).

## Architecture

```
OPTIK Website (Sales) → dApp Factory API (Generation) → Customer Downloads
```

## Integration Points

### 1. Form Submission Flow

**OPTIK Form** → **Your `/api/generations/create` endpoint**

```typescript
// OPTIK: app/api/generate-dapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

const DAPP_FACTORY_URL = process.env.DAPP_FACTORY_API_URL || 'http://localhost:3003';

export async function POST(request: NextRequest) {
  try {
    const optikFormData = await request.json();

    // Map OPTIK form to dApp Factory format
    const factoryRequest = {
      walletAddress: optikFormData.customerInfo.deliveryWallet,
      projectName: optikFormData.dappInfo?.projectName || optikFormData.tokenInfo.name,
      projectDescription: optikFormData.tokenInfo.description || 'Production-ready Solana dApp',
      projectType: mapProductType(optikFormData.productType),
      tier: mapTierToFactory(optikFormData),
      tokenConfig: optikFormData.productType !== 'dapp-only' ? {
        name: optikFormData.tokenInfo.name,
        symbol: optikFormData.tokenInfo.symbol,
        decimals: optikFormData.tokenInfo.decimals,
        totalSupply: parseInt(optikFormData.tokenInfo.totalSupply),
      } : undefined,
    };

    // Call dApp Factory
    const response = await fetch(`${DAPP_FACTORY_URL}/api/generations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(factoryRequest),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    // Store mapping for tracking
    await storeOrderMapping({
      optikJobId: generateJobId(),
      factoryGenerationId: result.generationId,
      customerInfo: optikFormData.customerInfo,
      totalPrice: optikFormData.meta.totalPrice,
      treasuryWallet: result.treasuryWallet,
      paymentAmount: result.paymentAmount,
    });

    return NextResponse.json({
      success: true,
      jobId: result.generationId, // Use factory's generationId as jobId
      treasuryWallet: result.treasuryWallet,
      paymentAmount: result.paymentAmount,
    });

  } catch (error: any) {
    console.error('OPTIK → Factory integration error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function mapProductType(optikType: string): 'dapp' | 'token' | 'both' {
  const mapping: Record<string, 'dapp' | 'token' | 'both'> = {
    'token-only': 'token',
    'dapp-only': 'dapp',
    'token-and-dapp': 'both',
  };
  return mapping[optikType] || 'dapp';
}

function mapTierToFactory(formData: any): 'starter' | 'professional' | 'enterprise' {
  // Map OPTIK's tier-1/tier-2/tier-3 to factory's starter/professional/enterprise
  if (formData.productType === 'token-and-dapp') {
    // Use the higher tier
    const dappTier = formData.dappTier === 'tier-3' ? 'enterprise' :
                     formData.dappTier === 'tier-2' ? 'professional' : 'starter';
    return dappTier;
  }

  const tier = formData.tokenTier || formData.dappTier;
  return tier === 'tier-3' ? 'enterprise' :
         tier === 'tier-2' ? 'professional' : 'starter';
}

function generateJobId(): string {
  return `optik_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

async function storeOrderMapping(data: any) {
  // Store in a simple JSON file or database
  // This maps OPTIK job IDs to factory generation IDs
  const fs = require('fs').promises;
  const path = require('path');

  const mappingsPath = path.join(process.cwd(), 'order-mappings.json');

  let mappings: any = {};
  try {
    mappings = JSON.parse(await fs.readFile(mappingsPath, 'utf-8'));
  } catch (error) {
    // File doesn't exist yet
  }

  mappings[data.optikJobId] = data;

  await fs.writeFile(mappingsPath, JSON.stringify(mappings, null, 2));
}
```

### 2. Payment Verification

**OPTIK Payment** → **Your `/api/payments/verify` endpoint**

```typescript
// OPTIK: app/api/payment/crypto/route.ts (updated)
export async function POST(request: NextRequest) {
  try {
    const { jobId, transactionSignature } = await request.json();

    // Verify on dApp Factory
    const response = await fetch(`${DAPP_FACTORY_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationId: jobId, // Using factory's generationId
        transactionSignature,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Trigger generation
      await fetch(`${DAPP_FACTORY_URL}/api/generations/${jobId}/generate`, {
        method: 'POST',
      });

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment verified, generation started',
      });
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 3. Status Tracking

**OPTIK Status Check** → **Your `/api/generations/[id]` endpoint**

```typescript
// OPTIK: app/api/check-status/[jobId]/route.ts (updated)
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // Get status from dApp Factory
    const response = await fetch(`${DAPP_FACTORY_URL}/api/generations/${jobId}`);
    const factoryData = await response.json();

    if (!factoryData.success) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    const generation = factoryData.generation;

    // Map factory status to OPTIK format
    return NextResponse.json({
      jobId,
      status: mapFactoryStatus(generation.status),
      createdAt: generation.timestamps.created,
      estimatedCompletion: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      completedAt: generation.timestamps.generationCompleted,
      productType: generation.projectType,
      totalPrice: generation.payment.amount,
      downloadUrl: generation.downloadToken ? `/api/download/${generation.downloadToken}` : undefined,
      progressPercentage: calculateProgress(generation.status),
      currentPhase: mapStatusToPhase(generation.status),
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function mapFactoryStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const mapping: Record<string, any> = {
    'pending_payment': 'pending',
    'payment_confirmed': 'processing',
    'generating': 'processing',
    'review_required': 'processing',
    'approved': 'processing',
    'completed': 'completed',
    'failed': 'failed',
  };
  return mapping[status] || 'processing';
}

function calculateProgress(status: string): number {
  const progress: Record<string, number> = {
    'pending_payment': 0,
    'payment_confirmed': 20,
    'generating': 50,
    'review_required': 75,
    'approved': 90,
    'completed': 100,
  };
  return progress[status] || 0;
}

function mapStatusToPhase(status: string): string {
  const phases: Record<string, string> = {
    'pending_payment': 'Awaiting Payment',
    'payment_confirmed': 'Smart Contract Development',
    'generating': 'Frontend Development',
    'approved': 'Final Packaging',
    'completed': 'Complete',
  };
  return phases[status] || 'Processing';
}
```

### 4. Download Proxy

**OPTIK Download** → **Your `/api/download/[token]` endpoint**

```typescript
// OPTIK: app/api/download/[jobId]/route.ts (updated)
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Get the download token from factory
    const statusResponse = await fetch(`${DAPP_FACTORY_URL}/api/generations/${params.jobId}`);
    const statusData = await statusResponse.json();

    if (!statusData.success || !statusData.generation.downloadToken) {
      return NextResponse.json({ error: 'Download not available' }, { status: 404 });
    }

    // Proxy the download
    const downloadResponse = await fetch(
      `${DAPP_FACTORY_URL}/api/download/${statusData.generation.downloadToken}`
    );

    if (!downloadResponse.ok) {
      return NextResponse.json({ error: 'Download failed' }, { status: 404 });
    }

    const fileBuffer = await downloadResponse.arrayBuffer();

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="optik-dapp-${params.jobId}.zip"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Environment Variables

Add to your OPTIK `.env`:

```bash
# dApp Factory Integration
DAPP_FACTORY_API_URL=http://localhost:3003
# or production: https://your-dapp-factory-domain.com

# Use the same treasury wallet
OPTIK_TREASURY_WALLET=CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB
```

## Pricing Alignment

Your OPTIK prices ($4,999-$29,999) are much higher than the factory's devnet test prices ($1.1-$4.4 SOL).

**For production:**

Update factory `.env`:
```bash
# Convert USD to SOL (example: $100 SOL price)
NEXT_PUBLIC_STARTER_PRICE_SOL=49.99    # $4,999 ÷ $100/SOL
NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL=149.99  # $14,999 ÷ $100/SOL
NEXT_PUBLIC_ENTERPRISE_PRICE_SOL=299.99    # $29,999 ÷ $100/SOL
```

Or keep SOL prices low and handle USD conversion on OPTIK side with Stripe.

## Deployment

1. **Deploy dApp Factory backend** (the tested system)
   - Host on Vercel/AWS/GCP
   - Point to mainnet Solana
   - Use production MongoDB

2. **Deploy OPTIK frontend** (your sales site)
   - Host separately
   - Configure `DAPP_FACTORY_API_URL` to point to factory

3. **Test the integration**
   - Submit order on OPTIK
   - Verify it creates generation in factory
   - Confirm payment flow works
   - Check download delivery

## Quick Test

1. Start your dApp Factory: `npm run dev` (on port 3003)
2. Start OPTIK site: `npm run dev` (on different port, e.g., 3000)
3. Submit test order through OPTIK form
4. Verify it appears in factory MongoDB
5. Complete payment and check generation

---

## Benefits of This Architecture

✅ **Separation of Concerns**: Sales site separate from generation engine
✅ **Tested Backend**: Using the proven system we just validated
✅ **Scalability**: Can serve multiple frontend sites
✅ **Flexibility**: Easy to update OPTIK branding without touching generation logic
✅ **Reliability**: Tested payment and generation flows
