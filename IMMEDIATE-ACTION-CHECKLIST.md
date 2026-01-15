# Immediate Action Checklist
## Critical Security & Launch Preparation

**Date:** January 11, 2026
**Priority:** 🔴 CRITICAL
**Estimated Time:** 2-4 hours

---

## ⚠️ STOP - Read This First

Before proceeding with any production deployment, complete these critical security tasks. The system is functionally complete but has one **critical security vulnerability** that must be fixed immediately.

---

## 🔴 CRITICAL - Do Within 24 Hours

### ☐ Task 1: Rotate Treasury Keypair (30 minutes)

**Why:** Current private key is exposed in `.env.backup` file

**Steps:**

```bash
# 1. Generate new keypair
cd /home/kali/dapp-website
solana-keygen new --outfile ~/treasury-keypair-new.json

# 2. Get the public key
solana-keygen pubkey ~/treasury-keypair-new.json
# Save this address: __________________

# 3. Get the private key in base58 format
# Install bs58 CLI if needed
npm install -g bs58-cli

# Convert to base58
cat ~/treasury-keypair-new.json | jq -r '.' | tr -d '[],' | xargs | xxd -r -p | bs58

# Or use this one-liner:
solana-keygen pubkey ~/treasury-keypair-new.json --outfile /tmp/pubkey.txt && \
cat ~/treasury-keypair-new.json | python3 -c "import sys, json, base58; print(base58.b58encode(bytes(json.load(sys.stdin))).decode())"

# 4. Fund the new wallet (DEVNET for testing)
NEW_WALLET="PASTE_NEW_PUBLIC_KEY_HERE"
solana airdrop 50 $NEW_WALLET --url devnet

# Verify balance
solana balance $NEW_WALLET --url devnet

# 5. Update .env (or create .env.local)
cat > .env.local << EOF
# Updated Treasury Wallet - $(date)
NEXT_PUBLIC_SOLANA_TREASURY_WALLET=$NEW_WALLET
SOLANA_TREASURY_PRIVATE_KEY=NEW_BASE58_PRIVATE_KEY_HERE

# Copy other vars from .env.backup
$(grep -v "TREASURY" .env.backup)
EOF

# 6. Restart dev server
npm run dev
```

**Verification:**
```bash
# Test that new wallet works
curl -X POST http://localhost:3003/api/generations/create \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB",
    "projectName": "Test New Wallet",
    "projectDescription": "Testing rotated keypair",
    "projectType": "dapp",
    "tier": "starter"
  }'

# Should return new treasury wallet address
```

---

### ☐ Task 2: Remove Exposed Secrets from Git (15 minutes)

**Why:** `.env.backup` contains private key and is committed to git

**Steps:**

```bash
cd /home/kali/dapp-website

# 1. Add to .gitignore
echo ".env.backup" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.env" >> .gitignore

# 2. Remove from git tracking (but keep local file)
git rm --cached .env.backup

# 3. Commit the removal
git add .gitignore
git commit -m "security: Remove exposed environment files from git"

# 4. Push changes
git push origin main

# 5. For complete removal from git history (OPTIONAL - coordinate with team):
# WARNING: This rewrites history, requires force push
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.backup" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

**Verification:**
```bash
# Confirm file is not in git
git ls-files | grep "env"
# Should not show .env.backup

# Confirm file still exists locally (for reference)
ls -la .env.backup
# Should show file exists
```

---

### ☐ Task 3: Test OPTIK Integration Endpoints (30 minutes)

**Why:** Verify new endpoints work correctly

**Steps:**

Follow the guide: `OPTIK-INTEGRATION-TESTING.md`

Quick test:
```bash
# Test 1: Submit Order
curl -X POST http://localhost:3003/api/optik/submit-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "email": "test@example.com",
      "deliveryWallet": "CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB"
    },
    "productType": "dapp-only",
    "dappInfo": {
      "projectName": "Security Test",
      "description": "Testing after security fixes",
      "features": []
    },
    "dappTier": "tier-1",
    "meta": {
      "totalPrice": 4999,
      "currency": "USD"
    }
  }' | jq

# Save the jobId from response
export JOB_ID="PASTE_HERE"

# Test 2: Check Status
curl http://localhost:3003/api/optik/status/$JOB_ID | jq '.status, .phase'

# Test 3: Verify error handling
curl http://localhost:3003/api/optik/status/INVALID_ID | jq
# Should return error
```

**Verification Checklist:**
- [ ] Submit order returns 200 with jobId
- [ ] Status check returns correct status
- [ ] Invalid requests return proper error messages
- [ ] Logs show request IDs and structured messages

---

## 🟡 HIGH PRIORITY - Complete This Week

### ☐ Task 4: Implement Rate Limiting (2 hours)

**File to create:** `src/middleware/rateLimit.ts`

```typescript
import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (value.resetAt < now) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  request: NextRequest,
  limits: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const endpoint = request.nextUrl.pathname;
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  let entry = rateLimits.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + limits.windowMs,
    };
    rateLimits.set(key, entry);

    return {
      allowed: true,
      remaining: limits.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }

  if (entry.count >= limits.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;

  return {
    allowed: true,
    remaining: limits.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
```

**Apply to endpoints:**

Edit `/home/kali/dapp-website/src/app/api/optik/submit-order/route.ts`:

```typescript
import { rateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  // Add rate limiting
  const rateLimitResult = rateLimit(request, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 orders per 15 minutes per IP
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // ... rest of existing code
}
```

Apply same pattern to other OPTIK endpoints.

**Verification:**
```bash
# Test rate limiting
for i in {1..15}; do
  echo "Request $i:"
  curl -s -w "\nStatus: %{http_code}\n" http://localhost:3003/api/optik/status/test-id | head -1
  sleep 0.5
done

# Should see 429 status after 10 requests
```

---

### ☐ Task 5: Set Up Error Tracking (1 hour)

**Steps:**

```bash
# 1. Sign up for Sentry (free tier)
# Visit: https://sentry.io/signup/

# 2. Install Sentry SDK
npm install @sentry/nextjs

# 3. Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# 4. Update sentry.client.config.ts and sentry.server.config.ts with your DSN

# 5. Test error tracking
# Add to any route:
import * as Sentry from '@sentry/nextjs';

// Test error
Sentry.captureMessage('Test message from OPTIK integration');
```

**Verification:**
- [ ] Sentry dashboard shows test messages
- [ ] Errors are being captured
- [ ] Source maps uploaded

---

### ☐ Task 6: Add Structured Logging (2 hours)

**Install Pino:**

```bash
npm install pino pino-pretty
```

**Create Logger:**

File: `src/utils/logger.ts`

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

// Helper functions
export const createLogger = (component: string) => {
  return logger.child({ component });
};
```

**Replace console.log in services:**

```typescript
// Before:
console.log('Payment verified:', { generationId });

// After:
import { createLogger } from '@/utils/logger';
const logger = createLogger('SolanaService');

logger.info({ generationId }, 'Payment verified');
```

**Verification:**
```bash
# Restart server, should see pretty formatted logs
npm run dev

# Logs should look like:
# [12:34:56] INFO (SolanaService): Payment verified
#   generationId: "abc123"
```

---

## 🟢 MEDIUM PRIORITY - Complete in 2 Weeks

### ☐ Task 7: Set Up Production MongoDB (1 hour)

```bash
# 1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register

# 2. Create cluster (M10 recommended for production)

# 3. Create database user

# 4. Get connection string

# 5. Update production .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dapp-factory?retryWrites=true&w=majority

# 6. Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI').then(() => {
  console.log('✅ MongoDB connected');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});
"
```

---

### ☐ Task 8: Configure Production RPC (30 minutes)

**Option 1: Helius (Recommended)**

```bash
# 1. Sign up: https://www.helius.dev/
# 2. Create API key
# 3. Update .env:
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

**Option 2: QuickNode**

```bash
# 1. Sign up: https://www.quicknode.com/
# 2. Create Solana endpoint
# 3. Update .env:
NEXT_PUBLIC_SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR_KEY/
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

---

### ☐ Task 9: Set Up Monitoring (2 hours)

**Datadog Setup:**

```bash
# 1. Sign up for Datadog: https://www.datadoghq.com/

# 2. Install Datadog agent (for metrics)
npm install dd-trace

# 3. Create monitoring file
# File: src/utils/monitoring.ts
import tracer from 'dd-trace';

if (process.env.NODE_ENV === 'production') {
  tracer.init({
    service: 'dapp-factory',
    env: 'production',
    logInjection: true,
  });
}

export { tracer };

# 4. Import at top of app
# Add to src/app/layout.tsx:
import '@/utils/monitoring';
```

**Set up basic dashboard:**
1. API response times
2. Error rates
3. Generation completion rates
4. Payment success rates

---

### ☐ Task 10: Write Unit Tests (4-6 hours)

**Start with critical path:**

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Create test file
mkdir -p tests/unit/utils

# Create first test
cat > tests/unit/utils/SolanaService.test.ts << 'EOF'
import { SolanaService } from '@/utils/SolanaService';

describe('SolanaService', () => {
  it('should verify valid payment', async () => {
    // TODO: Implement
  });
});
EOF

# Run tests
npm test
```

**Priority order:**
1. SolanaService.verifyPayment (most critical)
2. AIService.analyzeCodeSecurity
3. FilePackagingService.packageProject
4. Generation model methods

---

## 📋 Verification Checklist

After completing all critical tasks, verify:

### Security
- [ ] New treasury keypair generated and funded
- [ ] Old private key no longer in git
- [ ] `.env.backup` in `.gitignore`
- [ ] Rate limiting working on all endpoints
- [ ] Error tracking capturing errors

### Functionality
- [ ] OPTIK order submission works
- [ ] Payment verification works
- [ ] Status tracking accurate
- [ ] Download endpoint serves files
- [ ] All logs show request IDs

### Infrastructure
- [ ] MongoDB Atlas configured (if doing production)
- [ ] Production RPC endpoint set up (if doing production)
- [ ] Monitoring capturing metrics
- [ ] Alerts configured

---

## 🎯 Success Metrics

You're ready to proceed when:

✅ All critical (🔴) tasks completed
✅ OPTIK integration tested end-to-end
✅ Rate limiting prevents abuse
✅ Errors captured in Sentry
✅ Logs are structured and searchable
✅ No exposed secrets in git

---

## 📞 Need Help?

**Errors during setup?**
1. Check server logs: `npm run dev`
2. Review error in Sentry dashboard
3. Check MongoDB connection
4. Verify Solana RPC responding

**Test failures?**
1. Check `OPTIK-INTEGRATION-TESTING.md`
2. Verify treasury wallet funded
3. Check network (devnet vs mainnet)
4. Review request/response in logs

---

## 📚 Reference Documents

- **Full Audit:** `COMPREHENSIVE-AUDIT-REPORT.md`
- **Testing Guide:** `OPTIK-INTEGRATION-TESTING.md`
- **Test Strategy:** `TESTING-STRATEGY.md`
- **Executive Summary:** `EXECUTIVE-SUMMARY.md`
- **Development Guide:** `CLAUDE.md`
- **Integration Guide:** `INTEGRATION-GUIDE.md`

---

## ⏱️ Time Estimate

- **Critical Tasks (1-3):** 1-2 hours
- **High Priority (4-6):** 4-6 hours
- **Medium Priority (7-10):** 6-8 hours

**Total: 11-16 hours to production-ready**

---

## 🚀 Next Steps After This Checklist

1. Complete comprehensive testing (TESTING-STRATEGY.md)
2. Set up production deployment
3. Configure backups
4. Train team on new endpoints
5. Soft launch with monitoring
6. Scale up gradually

---

**Last Updated:** January 11, 2026
**Status:** Ready to Execute
**Priority:** START NOW

Good luck! 🎉
