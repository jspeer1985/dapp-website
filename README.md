# dApp Factory Platform

A production-ready Next.js 14 platform for AI-powered Solana dApp generation with integrated payment processing, SPL token minting, and automated security analysis.

## Features

- **AI Code Generation**: Automatically generate complete dApp projects using OpenAI or Anthropic
- **Solana Integration**: Full wallet adapter support (Phantom, Solflare, Torus, Ledger)
- **Direct SOL Payments**: On-chain payment verification without third-party services
- **SPL Token Minting**: Create and deploy custom SPL tokens
- **Security Analysis**: Automated code scanning and risk assessment
- **Admin Dashboard**: Review and approve high-risk generations
- **Real-time Updates**: Live generation progress tracking
- **File Packaging**: Automated project packaging and download management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Blockchain**: Solana (@solana/web3.js, @solana/spl-token)
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Database**: MongoDB with Mongoose
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Charts**: Recharts
- **File Handling**: Archiver, JSZip

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Solana wallet (for treasury operations)
- OpenAI API key or Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dapp-website
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TREASURY_WALLET=<your_treasury_public_key>
SOLANA_TREASURY_PRIVATE_KEY=<your_treasury_private_key_base58>

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dapp-factory

# AI Provider (choose one)
OPENAI_API_KEY=sk-proj-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

AI_PROVIDER=openai
AI_MODEL=gpt-4-turbo-preview

# Pricing - Tiered Structure
NEXT_PUBLIC_STARTER_PRICE_SOL=1.1
NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL=2.1
NEXT_PUBLIC_ENTERPRISE_PRICE_SOL=4.4
NEXT_PUBLIC_STARTER_PRICE_USD=149
NEXT_PUBLIC_PROFESSIONAL_PRICE_USD=279
NEXT_PUBLIC_ENTERPRISE_PRICE_USD=599

# Security
JWT_SECRET=your_random_secret_key_here
ENCRYPTION_KEY=your_32_character_key_here
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout with wallet provider
│   ├── page.tsx             # Landing page
│   ├── factory/             # dApp creation flow
│   ├── launch/              # Generation status
│   ├── success/             # Download page
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── premium/             # Landing page sections
│   ├── factory/             # Factory flow components
│   └── admin/               # Admin components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
├── models/                  # MongoDB models
├── types/                   # TypeScript types
└── utils/                   # Service utilities
```

## Key Components

### Payment Flow
1. User connects Solana wallet
2. Fills project form
3. Creates generation record
4. Sends SOL to treasury wallet
5. System verifies payment on-chain
6. Triggers AI generation

### Generation Flow
1. Payment confirmed
2. AI generates complete project
3. Security analysis runs
4. High-risk projects require manual review
5. Low-risk projects auto-approved and packaged
6. Download link provided with expiration

### Admin Review
- Admins review high-risk generations
- Approve or reject with notes
- Rejected projects automatically refunded

## API Routes

- `POST /api/generations/create` - Create new generation
- `GET /api/generations/[id]` - Get generation status
- `POST /api/generations/[id]/generate` - Trigger AI generation
- `POST /api/payments/verify` - Verify SOL payment
- `POST /api/tokens/mint` - Create SPL token
- `GET /api/downloads/[token]` - Download project files
- `GET /api/admin/reviews` - List pending reviews
- `POST /api/admin/approve` - Approve/reject generation

## Security Features

- On-chain payment verification (never trust client)
- Automated code security analysis
- Pattern matching for vulnerabilities (XSS, SQL injection, etc.)
- Risk scoring algorithm (0-100)
- Manual review for high-risk projects
- Download token expiration (24h, 10 downloads max)
- Rate limiting on API routes
- Input validation with Zod schemas

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. **MongoDB**: Set up MongoDB Atlas or local instance
2. **Solana Wallet**: Create treasury wallet and fund it for refunds/token creation
3. **RPC Endpoint**: Use reliable RPC service (Helius, QuickNode, etc.)
4. **AI API**: Ensure API keys are valid and have sufficient credits

### Vercel Deployment

1. Push to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

## Monitoring

- Log all payment verifications
- Track generation errors
- Monitor API usage and costs
- Set up alerts for failed refunds

## Pricing Tiers

The platform offers three tiers to suit different user needs:

### Starter - $149 (~1.1 SOL)
**Target**: First-time serious creators
- AI-generated Solana dApp + Token
- Security Pulse analysis
- Hosting-ready code
- Basic analytics
- Whitelisted launch approval

### Professional - $279 (~2.1 SOL) ⭐ Most Popular
**Target**: Legitimate projects with community
- All Starter features
- Full tokenomics dashboard
- Advanced compliance & audit report
- Priority support
- Branding templates

### Enterprise - $599 (~4.4 SOL)
**Target**: Well-funded teams / VCs
- All Professional features
- Dedicated AI Agent terminal
- Custom workflow automation
- Full audit + risk assessment
- Marketing guidance
- VIP launch & promotion support

## Cost Estimates

- **AI Generation**: ~$0.01-0.10 per dApp (depending on complexity)
- **Solana Fees**: ~0.000005 SOL per transaction (negligible)
- **MongoDB**: Free tier sufficient for MVP

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Your repo issues page]
- Documentation: [Your docs site]

## Acknowledgments

- Built on Solana blockchain
- Powered by OpenAI/Anthropic AI
- UI components from Radix UI
- Wallet adapter from Solana Labs

---

Built with ❤️ for the Solana ecosystem
# dapp-website
