# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Production build
npm start               # Start production server
npm run type-check      # Run TypeScript checks without building
npm run lint            # Run ESLint

# Prerequisites
mongod                  # Start local MongoDB (or use Atlas URI)
```

## Architecture Overview

This is an **AI-powered Solana dApp generation platform** with Stripe payment integration built on Next.js 14 (App Router). The system orchestrates complex workflows involving dual payment rails (Stripe + SOL), AI code generation, security analysis, and admin review processes.

### Core Data Flow

```
User → Factory Form → Payment (Stripe or SOL) → Verification → AI Generation → Security Analysis → (Optional) Admin Review → File Packaging → Download
```

### Payment Architecture

**Dual Payment Rails**:
- **Stripe Checkout**: Primary payment method for USD/credit card transactions
  - Session-based checkout flow
  - Webhook-driven fulfillment
  - Full subscription support
- **Solana Crypto**: Alternative payment method for SOL transactions
  - On-chain verification
  - Direct wallet-to-wallet transfers
  - Treasury wallet management

**Payment Flow**:
1. User selects payment method (Stripe or Crypto)
2. For Stripe: Redirect to Stripe Checkout → webhook fulfillment
3. For Crypto: Send SOL → on-chain verification → fulfillment
4. Both paths converge to trigger AI generation

### Critical Components & Their Responsibilities

**1. Service Layer (`src/utils/`)**

The singleton services are the backbone of the system:

- **AIService** (`src/utils/AIService.ts`): Manages OpenAI/Anthropic integration
  - Provider determined by `AI_PROVIDER` env var (openai/anthropic)
  - `generateDApp()`: Main generation method - returns files, packageJson, readme
  - `analyzeCodeSecurity()`: Security scanner with pattern matching
  - Risk patterns: eval usage (30pts), dangerouslySetInnerHTML (25pts), localStorage privateKey (40pts)
  - Returns risk score (0-100) and flags array
  - Supports both OpenAI (gpt-4-turbo-preview) and Anthropic (claude-3-5-sonnet-20241022)

- **SolanaService** (`src/utils/SolanaService.ts`): Handles all blockchain operations
  - Singleton exports default instance with initialized connection and treasury keypair
  - `verifyPayment()`: On-chain verification by examining transaction preBalances/postBalances
  - `createToken()`: SPL token minting using `@solana/spl-token`
  - `processRefund()`: Automated refunds for failed/rejected generations
  - Treasury keypair loaded from `SOLANA_TREASURY_PRIVATE_KEY` (base58-encoded)

- **FilePackagingService** (`src/utils/FilePackagingService.ts`): Creates downloadable zip files
  - Uses `archiver` library for zip creation
  - Automatically adds config files (.gitignore, tsconfig.json, .env.example, .eslintrc.json)
  - Stores files in `temp/downloads/` directory
  - Generates cryptographic download tokens (nanoid)
  - Implements file expiration based on `TEMP_FILE_RETENTION_HOURS`

- **RefundService** (`src/utils/RefundService.ts`): Orchestrates refund flow
  - Coordinates between SolanaService and Generation model
  - Updates status to 'refunded'
  - Triggers on-chain refund transactions

**2. MongoDB Models (`src/models/`)**

- **Generation** (`src/models/Generation.ts`): Central model tracking entire lifecycle
  - Status transitions: `pending_payment` → `payment_confirmed` → `generating` → `review_required`/`approved` → `completed`
  - Risk score > 50 OR high severity flags triggers `review_required` status
  - Payment supports both SOL and USD currencies
  - Files structure: `{ path, content, language }[]`
  - Methods: `canDownload()`, `incrementDownloadCount()`
  - Timestamps: created, paymentConfirmed, generationStarted, generationCompleted, approved

- **TemplatePurchase** (`src/models/TemplatePurchase.ts`): Tracks template purchases
- **User** (`src/models/User.ts`): User authentication (future implementation)

**3. API Route Architecture**

**Generation Flow**:
- **POST `/api/generations/create`**: Creates Generation record, returns `generationId` and `treasuryWallet`
- **POST `/api/payments/verify`**: Verifies SOL payment on-chain, updates Generation status
- **POST `/api/generations/[id]/generate`**: Main orchestrator
  - Calls `AIService.generateDApp()`
  - Runs `AIService.analyzeCodeSecurity()`
  - Decides if review required (risk > 50 or high severity flags)
  - Auto-packages if approved
  - Sends completion email
- **GET `/api/generations/[id]`**: Status polling endpoint
- **POST `/api/admin/approve`**: Admin approval/rejection endpoint

**Payment Endpoints**:
- **POST `/api/billing/create-checkout`**: Creates Stripe checkout session
- **POST `/api/payments/webhook`**: Stripe webhook handler (stripe signature verification)
  - Handles checkout.session.completed
  - Handles payment_intent.succeeded
  - Processes invoice events
  - Manages subscriptions
  - Triggers generation on successful payment
- **POST `/api/payments/crypto`**: Initiates crypto payment flow
- **POST `/api/payments/verify`**: Verifies Solana transaction

**Stripe Integration**:
- **POST `/api/stripe/create-checkout-session`**: Alternative Stripe checkout endpoint
- **POST `/api/stripe/webhook`**: Stripe webhook for template purchases
- **GET `/api/stripe/test-config`**: Tests Stripe configuration

**Download System**:
- **GET `/api/downloads/[token]`**: Token-based file download
  - Validates token and expiration
  - Enforces download limits (default: 10)
  - Increments download counter
  - Serves zip file

**Admin Endpoints**:
- **GET `/api/admin/downloads`**: List all downloads
- **GET `/api/admin/jobs`**: List all generation jobs
- **POST `/api/admin/approve`**: Approve/reject generation
- **GET `/api/admin/reviews`**: List pending reviews

**4. Frontend Architecture**

- **Root Layout** (`src/app/layout.tsx`): Wraps everything in `WalletContextProvider` (Solana wallet adapter)
- **Factory Flow** (`src/components/ProjectFactory.tsx`): Tab-based wizard
  1. ProjectForm → creates generation, collects requirements
  2. PaymentFlow → Stripe or SOL payment selection
  3. GenerationProgress → polls status every 3s, shows progress

- **Payment Components**:
  - `PricingTiers` → displays tier options with Stripe checkout
  - `DynamicPricingTiers` → dynamic pricing with real-time updates
  - `StripePayment` → Stripe Elements integration (future)

- **Real-time Polling**: `useGenerationPolling` hook polls `/api/generations/[id]` every 3s

### Environment Variables

**Required**:
- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_SOLANA_NETWORK`: devnet or mainnet-beta
- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC endpoint
- `SOLANA_TREASURY_PRIVATE_KEY`: Base58-encoded private key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `AI_PROVIDER`: openai or anthropic
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Depending on provider

**Optional**:
- `NEXT_PUBLIC_APP_URL`: App base URL (default: http://localhost:3000)
- `TEMP_FILE_RETENTION_HOURS`: File expiration time (default: 24)
- `RESEND_API_KEY`: Email service API key

### Security Architecture

**Payment Verification**:
- **Stripe**: Webhook signature verification using `stripe.webhooks.constructEvent()`
- **Solana**: On-chain transaction verification
  - Fetches transaction from blockchain
  - Verifies sender, recipient, amount
  - Checks preBalances/postBalances delta
  - Ensures transaction succeeded (no `meta.err`)

**Code Security Analysis**:
- Pattern-based scanning in `AIService.analyzeCodeSecurity()`
- Dangerous patterns with point values:
  - `eval()` usage: 30 points, severity: high
  - `dangerouslySetInnerHTML`: 25 points, severity: high
  - `localStorage.setItem.*privateKey`: 40 points, severity: critical
  - `.innerHTML =`: 15 points, severity: medium
  - `process.env.*` exposure: 5 points, severity: low
  - `Math.random()`: 10 points, severity: medium
- Risk score normalized to 0-100
- Risk > 50 OR any high severity flag → manual review required

**Download Security**:
- Cryptographically random tokens (nanoid/32)
- 24-hour expiration from creation
- Maximum 10 downloads per token
- Token validated before serving file
- Generation status must be 'completed'

### Stripe Integration Details

**API Version**: `2025-12-15.clover`

**Webhook Events Handled**:
- `checkout.session.completed`: Main payment completion event
- `payment_intent.succeeded`: Direct payment success
- `invoice.paid`: Subscription invoice paid
- `invoice.payment_failed`: Payment failure
- `customer.subscription.created/updated/deleted`: Subscription lifecycle

**Payment Models**:
- One-time payments: Template purchases, project generation
- Subscriptions: Monthly/annual plans with metered billing support
- Payment currencies: USD (Stripe), SOL (crypto)

**Error Handling**:
- Idempotency manager for webhook deduplication
- Event queue with retry logic (3 attempts, exponential backoff)
- Dead letter queue for failed events
- Comprehensive logging with pino

### Key Behavioral Notes

- **Wallet Integration**: Uses `@solana/wallet-adapter-react` with support for Phantom, Solflare, Torus, Ledger

- **MongoDB Connection**: Singleton pattern with global caching prevents connection exhaustion

- **File Storage**: Generated zips in `temp/downloads/` with automatic cleanup

- **AI Generation**:
  - Expects JSON structure: `{files: [{path, content, type}], packageJson, readme, totalFiles, totalLines}`
  - OpenAI uses `response_format: { type: 'json_object' }`
  - Anthropic enforces JSON in system message

- **State Machine**: Strict status transitions enforced in Generation model

- **Type Safety**: Fixed common type issues with proper assertions:
  - Stripe invoice.subscription requires type assertion
  - GeneratedFile interface exported from AIService
  - Currency type enforced as 'USD' | 'SOL'

### Recent Fixes (January 2026)

1. **AIService Complete Rewrite**:
   - Added missing `generateDApp()` method with full OpenAI/Anthropic support
   - Added missing `analyzeCodeSecurity()` method with pattern-based scanning
   - Fixed export structure (singleton instance)
   - Proper TypeScript types for all methods

2. **Stripe Integration**:
   - Updated API version to `2025-12-15.clover`
   - Fixed invoice.subscription type issues with proper assertions
   - Fixed currency type constraints (USD | SOL)
   - Removed deprecated `redirectToCheckout()` in favor of direct URL navigation

3. **Type System**:
   - Fixed GeneratedFile type export
   - Fixed Generation model file structure types
   - Fixed all webhook type errors
   - Removed unused enterprise lib files (api-gateway, generator-service, deployment services, billing services)

4. **Build System**:
   - All TypeScript errors resolved (0 errors)
   - Build completes successfully
   - Suspense boundary warnings documented (non-blocking)
   - Production-ready build artifacts generated

### Disabled Files (Unused Enterprise Features)

The following files were disabled to fix build issues (renamed to .disabled):
- `src/lib/api-gateway.ts`
- `src/lib/api-gateway-express.ts`
- `src/lib/generator-service.ts`
- `src/lib/generator-service-internal.ts`
- `src/lib/deployment-orchestrator.ts`
- `src/lib/deployment-service.ts`
- `src/lib/white-label-system.ts`
- `src/lib/billing-service.ts`
- `src/lib/billing-system.ts`

These files contained enterprise features not currently in use. They can be re-enabled when needed.

### Known Build Warnings

**Suspense Boundary Warnings**: Pages using `useSearchParams()` need Suspense boundaries:
- `/cancelled`
- `/launch`
- `/factory`
- `/success`
- `/templates/success`

These warnings don't prevent build or deployment but should be addressed for better performance.

### Common Gotchas

1. **Wallet Adapter**: Requires `'use client'` directive
2. **Environment Variables**: `NEXT_PUBLIC_*` exposed to browser, others server-only
3. **Stripe Webhooks**: Must use raw body for signature verification
4. **MongoDB Indexes**: Defined in schema but require database to create
5. **SPL Token Creation**: Requires funded treasury wallet
6. **Payment Tolerance**: 0.1% tolerance in Solana payment verification

### Testing Workflow

1. Start MongoDB: `mongod` (or use Atlas)
2. Configure `.env` with all required variables
3. Run dev server: `npm run dev`
4. Test Stripe: Use test card 4242 4242 4242 4242
5. Test Solana: Connect Phantom wallet with devnet SOL
6. Monitor logs for generation progress
7. Check MongoDB for Generation records

### Production Deployment Checklist

- [ ] Switch `NEXT_PUBLIC_SOLANA_NETWORK` to `mainnet-beta`
- [ ] Use production Solana RPC endpoint (Helius/QuickNode)
- [ ] Fund treasury wallet for refunds
- [ ] Set up MongoDB Atlas with indexes
- [ ] Configure Stripe webhook URL in dashboard
- [ ] Enable Stripe live mode
- [ ] Monitor AI API costs
- [ ] Set up error tracking (Sentry)
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting middleware
- [ ] Configure email service (Resend)

### Path Aliases

TypeScript configured with path aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/utils/*` → `./src/utils/*`
- `@/models/*` → `./src/models/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/hooks/*` → `./src/hooks/*`

### Support and Documentation

For more detailed information:
- See `AI-AGENT-PIPELINE-ARCHITECTURE.md` for agent orchestration
- See `STRIPE_INTEGRATION_GUIDE.md` for payment details
- See `COMPREHENSIVE-AUDIT-REPORT.md` for full audit findings
