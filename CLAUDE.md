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

This is an **AI-powered Solana dApp generation platform** built on Next.js 14 (App Router). The system orchestrates complex workflows involving blockchain payments, AI code generation, security analysis, and admin review processes.

### Core Data Flow

```
User → Factory Form → Payment (SOL) → Verification → AI Generation → Security Analysis → (Optional) Admin Review → File Packaging → Download
```

### Critical Components & Their Responsibilities

**1. Service Layer (`src/utils/`)**

The singleton services are the backbone of the system:

- **SolanaService**: Handles all blockchain operations. Singleton exports default instance with initialized connection and treasury keypair. Key methods:
  - `verifyPayment()`: On-chain verification by examining transaction preBalances/postBalances
  - `createToken()`: SPL token minting using `@solana/spl-token`
  - `processRefund()`: Automated refunds for failed/rejected generations

- **AIService**: Manages OpenAI/Anthropic integration. Provider determined by `AI_PROVIDER` env var. Constructs prompts requesting JSON output with file structure. `analyzeCodeSecurity()` scans generated code for patterns (eval, dangerouslySetInnerHTML, etc.) and calculates risk score.

- **FilePackagingService**: Creates downloadable zip files with archiver. Adds config files (.gitignore, tsconfig.json, .env.example) automatically. Manages temp directory and expiration.

- **RefundService**: Orchestrates refund flow by coordinating SolanaService and Generation model updates.

**2. MongoDB Models (`src/models/`)**

- **Generation**: Central model tracking entire lifecycle. Key status transitions:
  - `pending_payment` → `payment_confirmed` → `generating` → `review_required`/`approved` → `completed`
  - Risk score > 50 OR high severity flags triggers `review_required` status
  - Contains methods: `canDownload()`, `incrementDownloadCount()`

**3. API Route Orchestration (`src/app/api/`)**

Key workflow endpoints:

- **POST `/api/generations/create`**: Creates Generation record, returns `generationId` and `treasuryWallet`
- **POST `/api/payments/verify`**: Calls `SolanaService.verifyPayment()`, updates payment status
- **POST `/api/generations/[id]/generate`**: Main orchestrator - calls AIService, runs security analysis, decides review path, packages files if auto-approved
- **POST `/api/admin/approve`**: Admin action - approves or rejects, triggers packaging or refund

**4. Frontend Architecture**

- **Root Layout** (`src/app/layout.tsx`): Wraps everything in `WalletContextProvider` (Solana wallet adapter)
- **Factory Flow** (`src/components/ProjectFactory.tsx`): Tab-based wizard:
  1. ProjectForm → creates generation
  2. PaymentFlow → sends SOL & verifies
  3. GenerationProgress → polls status every 3s, redirects to success on completion

- **Real-time Polling**: `useGenerationPolling` hook polls `/api/generations/[id]` every 3s for status updates

### Environment Variable Critical Paths

- **SOLANA_TREASURY_PRIVATE_KEY**: Required for token minting and refunds. Base58-encoded, decoded via `bs58` library
- **AI_PROVIDER**: Determines OpenAI vs Anthropic initialization in AIService constructor
- **NEXT_PUBLIC_SOLANA_RPC_URL**: Used by both frontend (wallet adapter) and backend (SolanaService)

### Security Architecture

**Payment Verification**:
- Never trust client. Backend fetches transaction from blockchain and verifies:
  - Sender matches expected wallet
  - Amount transferred to treasury (checks preBalances/postBalances delta)
  - Transaction succeeded (no `meta.err`)

**Code Security Analysis**:
- Pattern-based scanning in `AIService.analyzeCodeSecurity()`
- Risk accumulation: each flag adds to `totalRisk` (eval=30, privateKey in localStorage=40, etc.)
- Normalized to 0-100 score
- Risk > 50 → manual review required

**Download Security**:
- Cryptographically random tokens (nanoid)
- 24h expiration + 10 download max
- Token validated before serving file

### Key Behavioral Notes

- **Wallet Integration**: Uses `@solana/wallet-adapter-react` with support for Phantom, Solflare, Torus, Ledger. The `WalletContextProvider` must wrap the entire app.

- **MongoDB Connection**: Uses singleton pattern with global caching to prevent connection exhaustion in serverless environments.

- **File Storage**: Generated zips stored in `temp/downloads/` with automatic cleanup based on `TEMP_FILE_RETENTION_HOURS`.

- **AI Generation**: Expects JSON response with `{files: [], packageJson: {}, readme: ""}` structure. Both OpenAI and Anthropic use similar prompts but different API call patterns.

- **State Machine**: Generation status follows strict state machine. Invalid transitions will cause errors. The only backward transition is to `failed` or `refunded`.

### Common Gotchas

1. **Wallet Adapter**: Requires `'use client'` directive in components that use hooks like `useWallet()`
2. **Environment Variables**: `NEXT_PUBLIC_*` exposed to browser, others server-only. Solana treasury private key MUST be server-only.
3. **MongoDB Indexes**: Defined in schema but require `mongod` to create. Check indexes if queries are slow.
4. **SPL Token Creation**: Requires treasury keypair. Will fail if `SOLANA_TREASURY_PRIVATE_KEY` not set.
5. **Payment Tolerance**: 0.1% tolerance allowed in payment verification to account for potential rounding.

### Testing Workflow

1. Start MongoDB: `mongod` (or use Atlas)
2. Configure `.env.local` with all required variables
3. Run dev server: `npm run dev`
4. Connect wallet (Phantom recommended for testing)
5. Use devnet SOL (get from faucet)
6. Test payment flow with small amounts (0.1 SOL)
7. Monitor generation logs in terminal
8. Check MongoDB for Generation records

### Production Deployment Checklist

- Switch `NEXT_PUBLIC_SOLANA_NETWORK` to `mainnet-beta`
- Use production RPC endpoint (Helius/QuickNode recommended)
- Fund treasury wallet sufficiently for refunds and token creation
- Set up MongoDB Atlas with proper indexes
- Configure rate limiting (referenced but not implemented)
- Monitor AI API costs and set limits
- Set up error tracking (Sentry recommended)
- Configure CORS for production domain

### AI Provider Configuration

**OpenAI**:
- Set `AI_PROVIDER=openai`
- Requires `OPENAI_API_KEY`
- Uses `response_format: { type: 'json_object' }` for structured output
- Default model: `gpt-4-turbo-preview`

**Anthropic**:
- Set `AI_PROVIDER=anthropic`
- Requires `ANTHROPIC_API_KEY`
- System message enforces JSON response
- Default model: `claude-3-5-sonnet-20241022`

### Path Aliases

TypeScript configured with path aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/utils/*` → `./src/utils/*`
- `@/models/*` → `./src/models/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/hooks/*` → `./src/hooks/*`
