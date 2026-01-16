import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIGenerationParams {
  projectName: string;
  projectDescription: string;
  projectType: 'dapp' | 'token' | 'both';
  features: string[];
  tokenConfig?: {
    name: string;
    symbol: string;
    totalSupply: number;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface AIGenerationResult {
  files: GeneratedFile[];
  packageJson: any;
  readme: string;
  totalFiles: number;
  totalLines: number;
  tokensUsed: number;
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private provider: 'openai' | 'anthropic';
  private model: string;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as 'openai' | 'anthropic') || 'openai';

    if (this.provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
    }
  }

  async generateDApp(params: AIGenerationParams): Promise<AIGenerationResult> {
    const prompt = this.buildPrompt(params);

    if (this.provider === 'openai') {
      return this.generateWithOpenAI(prompt);
    } else {
      // Determine tier based on features or project complexity
      const isTier4 = params.features.some(f => 
        f.toLowerCase().includes('compiler') || 
        f.toLowerCase().includes('generator') ||
        f.toLowerCase().includes('templates') ||
        f.toLowerCase().includes('multi-tenant') ||
        f.toLowerCase().includes('orchestration') ||
        f.toLowerCase().includes('enterprise') ||
        f.toLowerCase().includes('scalable') ||
        f.toLowerCase().includes('platform')
      );
      
      const isTier3 = !isTier4 && params.features.some(f => 
        f.toLowerCase().includes('staking') || 
        f.toLowerCase().includes('pools') ||
        f.toLowerCase().includes('rewards') ||
        f.toLowerCase().includes('solana') ||
        f.toLowerCase().includes('anchor') ||
        f.toLowerCase().includes('rust')
      );
      
      const isTier2 = !isTier4 && !isTier3 && params.features.some(f => 
        f.toLowerCase().includes('backend') || 
        f.toLowerCase().includes('dashboard') ||
        f.toLowerCase().includes('vesting') ||
        f.toLowerCase().includes('database') ||
        f.toLowerCase().includes('api')
      );

      let prompt = `You are an expert enterprise blockchain and full-stack developer. Generate a complete, production-ready ${isTier4 ? 'TIER 4 DAPP COMPILER PLATFORM' : isTier3 ? 'TIER 3 COMPLETE TOKEN + STAKING + POOLS PLATFORM' : isTier2 ? 'TIER 2 TOKEN + BACKEND + DASHBOARD PLATFORM' : 'TIER 1 BASIC TOKEN + dAPP'} project with the following specifications:

PROJECT NAME: ${params.projectName}
PROJECT DESCRIPTION: ${params.projectDescription}
PROJECT TYPE: ${params.projectType}
TIER LEVEL: ${isTier4 ? 'TIER 4 - Enterprise dApp Compiler Platform' : isTier3 ? 'TIER 3 - Complete Staking Platform' : isTier2 ? 'TIER 2 - Advanced Platform' : 'TIER 1 - Basic Template'}

REQUIRED FEATURES:
${params.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

${isTier4 ? `
TECHNICAL REQUIREMENTS - TIER 4 ENTERPRISE DAPP COMPILER PLATFORM:
- Multi-tenant dApp factory and compiler platform
- Advanced template engine with Handlebars compilation
- Complete project orchestration with pipeline management
- Enterprise-grade microservices architecture
- AI-powered code generation and optimization
- Advanced template registry and versioning system
- Real-time collaboration and project management
- Comprehensive deployment and provisioning system
- Enterprise monitoring and analytics
- Multi-framework support (Next.js, React, Vue, Svelte)
- Multi-blockchain deployment (Solana, Ethereum, Polygon, Base)

TIER 4 PROJECT STRUCTURE TO GENERATE:
\`\`\`
dapp-compiler-platform/
├── generator/
│   ├── templates/
│   │   ├── solana/
│   │   │   ├── token/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   ├── nft/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   ├── staking/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   ├── dex/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   ├── dao/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   ├── gaming/
│   │   │   │   ├── lib.rs.hbs
│   │   │   │   ├── Cargo.toml.hbs
│   │   │   │   └── config.json.hbs
│   │   │   └── custom/
│   │   │       ├── lib.rs.hbs
│   │   │       ├── Cargo.toml.hbs
│   │   │       └── config.json.hbs
│   │   └── frontend/
│   │       ├── nextjs-app/
│   │       │   ├── pages/
│   │       │   │   ├── index.tsx.hbs
│   │       │   ├── about.tsx.hbs
│   │       │   ├── contact.tsx.hbs
│   │       │   └── components/
│   │       │           ├── Header.tsx.hbs
│   │       │           ├── Footer.tsx.hbs
│   │       │           ├── Navigation.tsx.hbs
│   │       │           └── WalletConnect.tsx.hbs
│   │       ├── react-vite/
│   │       │   ├── src/
│   │       │   │   ├── App.tsx.hbs
│   │       │   ├── main.tsx.hbs
│   │       │   └── components/
│   │       │           ├── Button.svelte.hbs
│   │       │           └── Card.svelte.hbs
│   │       └── sveltekit/
│   │           ├── src/
│   │       │           ├── routes/
│   │       │           │   ├── +layout.server.ts.hbs
│   │       │           └── lib/
│   │       │               └── client.ts.hbs
│   │       └── package.json.hbs
├── schemas/
│   ├── project-schema.json
│   ├── contract-schema.json
│   ├── validation-rules.json
│   └── template-registry.json
├── src/
│   ├── index.ts (Main orchestration engine)
│   ├── core/
│   │   ├── orchestration-engine.ts
│   │   ├── pipeline-executor.ts
│   │   ├── state-manager.ts
│   │   └── project-generator.ts
│   ├── deployers/
│   │   ├── contract-deployer.ts
│   │   ├── frontend-deployer.ts
│   │   ├── backend-deployer.ts
│   │   ├── resource-provisioner.ts
│   │   ├── storage-provisioner.ts
│   │   ├── hosting-provisioner.ts
│   │   └── rpc-provisioner.ts
│   ├── provisioners/
│   ├── database-provisioner.ts
│   ├── storage-provisioner.ts
│   ├── hosting-provisioner.ts
│   └── rpc-provisioner.ts
│   ├── pipelines/
│   │   ├── full-stack-pipeline.ts
│   │   ├── contract-only-pipeline.ts
│   │   └── update-pipeline.ts
│   ├── queues/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── workers/
│   │   │   │   ├── generation-worker.ts
│   │   │   │   ├── deployment-worker.ts
│   │   │   │   ├── provisioning-worker.ts
│   │   │   │   └── monitoring-worker.ts
│   │   │   ├── jobs/
│   │   │   │   ├── generate-project.job.ts
│   │   │   │   ├── deploy-contracts.job.ts
│   │   │   │   ├── provision-resources.job.ts
│   │   │   │   └── health-check.job.ts
│   │   │   └── processors/
│   │   │       ├── base-processor.ts
│   │   │       └── retry-handler.ts
│   │   └── package.json
│   └── services/
│       ├── ai-service/
│       │   ├── src/
│       │   │   ├── index.ts
│       │   │   ├── claude-client.ts
│       │   │   ├── code-generator.ts
│       │   │   ├── optimizer.ts
│       │   │   └── security-scanner.ts
│       │   └── package.json
│       └── analytics-service/
│           ├── src/
│           │   ├── index.ts
│           │   ├── metrics-collector.ts
│           │   └── reporter.ts
│           └── package.json
├── backend/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── projects.routes.ts
│   │   │   │   ├── deployments.routes.ts
│   │   │   │   ├── templates.routes.ts
│   │   │   │   └── users.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── projects.controller.ts
│   │   │   │   ├── deployments.controller.ts
│   │   │   │   ├── templates.controller.ts
│   │   │   │   └── users.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── deployment.service.ts
│   │   │   │   ├── template.service.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   └── cors.middleware.ts
│   │   │   └── database/
│   │   │       ├── models/
│   │   │       │   ├── migrations/
│   │   │       │   └── seeds/
│   │   │       └── package.json
│   │   └── queues/
│   │   │       ├── src/
│   │   │       │   ├── index.ts
│   │   │       │   ├── workers/
│   │   │       │   │   ├── generation-worker.ts
│   │   │       │   │   ├── deployment-worker.ts
│   │   │       │   │   ├── provisioning-worker.ts
│   │   │       │   │   └── monitoring-worker.ts
│   │   │       │   ├── jobs/
│   │   │       │   │   ├── generate-project.job.ts
│   │   │       │   │   ├── deploy-contracts.job.ts
│   │   │       │   │   ├── provision-resources.job.ts
│   │   │       │   │   └── health-check.job.ts
│   │   │       │   └── processors/
│   │   │       │   │       ├── base-processor.ts
│   │   │       │   │       └── retry-handler.ts
│   │   │       │   └── package.json
│   │   └── services/
│   │   │       ├── ai-service/
│   │   │       │   ├── src/
│   │   │       │   │   ├── index.ts
│   │   │       │   │   ├── claude-client.ts
│   │   │       │   │   ├── code-generator.ts
│   │   │       │   │   ├── optimizer.ts
│   │   │       │   │   └── security-scanner.ts
│   │   │       │   └── package.json
│   │   │       └── analytics-service/
│   │   │           ├── src/
│   │   │           │   ├── index.ts
│   │   │           │   ├── metrics-collector.ts
│   │   │           │   └── reporter.ts
│   │   │           └── package.json
│   └── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── deploy/
│   │   │   │       └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── SchemaBuilder.tsx
│   │   │   │   ├── TemplateSelector.tsx
│   │   │   │   ├── DeploymentPipeline.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │           ├── Sidebar.tsx
│   │   │   │           ├── Header.tsx
│   │   │   │           ├── UserManagement.tsx
│   │   │   │           └── ProjectMetrics.tsx
│   │   │   └── lib/
│   │   │           ├── api-client.ts
│   │   │           ├── websocket.ts
│   │   │           └── hooks/
│   │   │               ├── useProjects.ts
│   │   │               ├── useDeployments.ts
│   │   │               └── useTemplates.ts
│   │   └── package.json
│   │   └── config/
│   │       ├── environments/
│   │       │   ├── development.json
│   │       │   ├── staging.json
│   │       │   └── production.json
│   │       ├── templates/
│   │       │   ├── available-templates.json
│   │       │   └── template-registry.json
│   │       └── deployment/
│   │           ├── networks.json
│   │           └── providers.json
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── api-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── services.yaml
│   │   ├── terraform/
│   │   ├── main.tf
│   │   ├── database.tf
│   │   ├── storage.tf
│   │   └── hosting.tf
│   └── scripts/
│       ├── setup-dev.sh
│       ├── deploy-staging.sh
│       └── deploy-production.sh
├── config/
│   ├── environments/
│   │   ├── development.json
│   │   ├── staging.json
│   │   └── production.json
│   ├── templates/
│   │   ├── available-templates.json
│   │   └── template-registry.json
│   └── deployment/
│       ├── networks.json
│       └── providers.json
├── docker-compose.yml
├── .env.example
└── README.md
\`\`\`

` : isTier3 ? `
TECHNICAL REQUIREMENTS - TIER 3 COMPLETE STAKING PLATFORM:
- Complete Solana staking ecosystem with Anchor/Rust programs
- Multi-program architecture (Token + Staking + Rewards)
- Advanced indexing service for blockchain events
- Background job processing for rewards distribution
- Enterprise-grade backend with microservices
- Real-time staking dashboard with analytics
- Pool management and reward distribution
- Transaction history and tracking
- PostgreSQL database with proper indexing
- Production-ready deployment with Docker
- Comprehensive monitoring and logging

TIER 3 PROJECT STRUCTURE TO GENERATE:
\`\`\`
token-staking-platform/
├── contracts/
│   ├── programs/
│   │   ├── token/ (Anchor program)
│   │   ├── staking/ (Anchor program)
│   │   └── rewards/ (Anchor program)
│   ├── tests/ (Comprehensive test suite)
│   └── Anchor.toml
├── scripts/
│   ├── deploy/ (Multi-program deployment)
│   ├── verify/ (Contract verification)
│   └── utils/ (Deployment helpers)
├── orchestrator/ (Deployment orchestration)
├── backend/
│   ├── indexer/ (Solana event indexing)
│   ├── jobs/ (Background reward processing)
│   └── api/ (RESTful API services)
├── frontend/
│   ├── app/ (Next.js 14 with staking UI)
│   ├── components/ (Advanced staking components)
│   └── lib/ (Solana integration)
├── config/ (Network and pool configurations)
├── docker-compose.yml (Full development stack)
└── README.md
\`\`\`

` : isTier2 ? `
TECHNICAL REQUIREMENTS - TIER 2 PLATFORM STRUCTURE:
- Complete full-stack token platform with backend services
- PostgreSQL database with Prisma ORM
- REST API with Express.js and TypeScript
- JWT authentication with wallet signature verification
- Advanced smart contracts (Token + Vesting)
- Next.js 14 dashboard with authentication
- Real-time token analytics and metrics
- Vesting schedule management system
- Transaction history and tracking
- PostgreSQL database with proper indexing
- RESTful API design with proper error handling
- Rate limiting and security middleware
- Docker containerization for development
- Production-ready deployment configuration

TIER 2 PROJECT STRUCTURE TO GENERATE:
\`\`\`
tier2-token-platform/
├── contracts/
│   ├── Token.sol
│   ├── VestingContract.sol
│   └── hardhat.config.ts
├── scripts/
│   ├── deploy-token.ts
│   ├── deploy-vesting.ts
│   ├── deploy-all.ts
│   └── verify.ts
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── token.routes.ts
│   │   │   ├── vesting.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── token.controller.ts
│   │   │   ├── vesting.controller.ts
│   │   │   └── analytics.controller.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       └── error.middleware.ts
│   ├── services/
│   │   ├── blockchain.service.ts
│   │   ├── vesting.service.ts
│   │   └── analytics.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── vesting/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── TokenStats.tsx
│   │   │   ├── VestingSchedule.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   └── AnalyticsChart.tsx
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   └── shared/
│   │       ├── WalletConnect.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── contracts.ts
│   │   └── wagmi.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTokenData.ts
│   │   └── useVesting.ts
│   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── next.config.js
├── config/
│   ├── networks.json
│   ├── deployment.json
│   └── api.config.ts
├── .env.example
├── package.json
├── docker-compose.yml
└── README.md
\`\`\`

` : `
TECHNICAL REQUIREMENTS - TIER 1 TEMPLATE STRUCTURE:
- Complete project structure matching tier1-token-dapp/ template
- Smart contracts using Hardhat with OpenZeppelin
- Next.js 14 frontend with TypeScript
- Solana wallet integration using @solana/wallet-adapter
- RainbowKit for wallet connection UI
- Tailwind CSS for styling
- Multi-network support (Ethereum, Polygon, BSC, Sepolia testnet)
- Wagmi for Ethereum integration
- Viem for Ethereum utilities
- Responsive design and modern UI patterns
- Production-ready deployment scripts
- Contract verification scripts
- Environment variable configuration
- Comprehensive README with setup instructions

PROJECT STRUCTURE TO GENERATE:
\`\`\`
tier1-token-dapp/
├── contracts/
│   ├── Token.sol
│   └── hardhat.config.ts
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── TokenBalance.tsx
│   │   └── TokenInfo.tsx
│   ├── lib/
│   │   ├── contracts.ts
│   │   └── wagmi.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── postcss.config.js
├── config/
│   ├── networks.json
│   └── deployment.json
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

`}

    if (tokenConfig && (projectType === 'token' || projectType === 'both')) {
      prompt += `
TOKEN CONFIGURATION:
- Name: ${tokenConfig.name}
- Symbol: ${tokenConfig.symbol}
- Total Supply: ${tokenConfig.totalSupply}
${isTier2 ? `
- ERC20 standard with advanced features (pause, blacklist, mint/burn)
- Vesting contract integration
- OpenZeppelin contracts for maximum security
- Multi-signature support considerations
- Gas optimization features

SMART CONTRACT REQUIREMENTS - TIER 2:
- SPDX-License-Identifier: MIT
- Solidity ^0.8.20
- Import @openzeppelin/contracts/token/ERC20/ERC20.sol
- Import @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol
- Import @openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol
- Import @openzeppelin/contracts/access/Ownable.sol
- Constructor with name, symbol, initialSupply, decimals parameters
- Public decimals() function override
- Public mint(address to, uint256 amount) onlyOwner function
- pause() and unpause() onlyOwner functions
- blacklist() and unblacklist() onlyOwner functions
- Custom _update() function with blacklist checks
- Proper error handling and events
- Reentrancy protection on vesting contract

VESTING CONTRACT REQUIREMENTS - TIER 2:
- SPDX-License-Identifier: MIT
- Solidity ^0.8.20
- Import @openzeppelin/contracts/token/ERC20/IERC20.sol
- Import @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol
- Import @openzeppelin/contracts/access/Ownable.sol
- Import @openzeppelin/contracts/utils/ReentrancyGuard.sol
- VestingSchedule struct with beneficiary, amount, cliff, duration
- createVestingSchedule() function with schedule ID generation
- release() function with nonReentrant modifier
- computeReleasableAmount() function with time-based calculations
- revoke() function for emergency revocation
- Comprehensive events for all operations
` : `
- ERC20 standard with mint/burn capabilities
- OpenZeppelin contracts for security
- Decimals support
- Owner-only minting function

SMART CONTRACT REQUIREMENTS:
- SPDX-License-Identifier: MIT
- Solidity ^0.8.20
- Import @openzeppelin/contracts/token/ERC20/ERC20.sol
- Import @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol
- Import @openzeppelin/contracts/access/Ownable.sol
- Constructor with name, symbol, initialSupply, decimals parameters
- Public decimals() function override
- Public mint(address to, uint256 amount) onlyOwner function
- Proper error handling and events

`}
`;
    }

    prompt += `
OUTPUT FORMAT:
Provide a complete project structure as a JSON object with this exact format:
{
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "content": "file content here",
      "language": "typescript"
    }
  ],
  "packageJson": { ... root package.json content as object ... },
  "readme": "README.md content here"
}

${isTier2 ? `
TIER 2 TEMPLATE SPECIFIC FILES TO GENERATE:
1. contracts/Token.sol - Advanced ERC20 with pause/blacklist/mint/burn
2. contracts/VestingContract.sol - Complete vesting system with cliff/duration
3. contracts/hardhat.config.ts - Multi-network deployment config
4. scripts/deploy-token.ts - Token deployment script
5. scripts/deploy-vesting.ts - Vesting contract deployment
6. scripts/deploy-all.ts - Deploy both contracts
7. scripts/verify.ts - Contract verification script
8. backend/server.ts - Express server with middleware setup
9. backend/api/routes/auth.routes.ts - Authentication endpoints
10. backend/api/routes/token.routes.ts - Token management endpoints
11. backend/api/routes/vesting.routes.ts - Vesting management endpoints
12. backend/api/routes/analytics.routes.ts - Analytics endpoints
13. backend/api/controllers/auth.controller.ts - Auth logic with JWT
14. backend/api/controllers/token.controller.ts - Token business logic
15. backend/api/controllers/vesting.controller.ts - Vesting schedule management
16. backend/api/controllers/analytics.controller.ts - Analytics data processing
17. backend/api/middleware/auth.middleware.ts - JWT verification middleware
18. backend/services/blockchain.service.ts - Blockchain interaction service
19. backend/services/vesting.service.ts - Vesting contract service
20. backend/prisma/schema.prisma - Complete database schema
21. backend/utils/jwt.ts - JWT token utilities
22. backend/utils/logger.ts - Winston logging setup
23. backend/package.json - Backend dependencies
24. frontend/app/dashboard/page.tsx - Main dashboard with auth
25. frontend/components/dashboard/TokenStats.tsx - Token statistics display
26. frontend/components/dashboard/VestingSchedule.tsx - Vesting management UI
27. frontend/hooks/useAuth.ts - Authentication hook
28. docker-compose.yml - Full development environment
29. .env.example - Complete environment variables
30. package.json - Root project configuration
31. README.md - Comprehensive setup documentation

TIER 2 ADVANCED FEATURES TO IMPLEMENT:
- JWT authentication with wallet signature verification
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Session management with database storage
- Vesting schedule creation and management
- Real-time token analytics and metrics
- Transaction history tracking
- PostgreSQL database with proper indexing
- RESTful API design with proper error handling
- Rate limiting and security middleware
- Docker development environment
- Production deployment configurations
` : `
TIER 1 TEMPLATE SPECIFIC FILES TO INCLUDE:
1. contracts/Token.sol - Complete ERC20 with mint/burn
2. contracts/hardhat.config.ts - Multi-network configuration
3. scripts/deploy.ts - Automated deployment script
4. scripts/verify.ts - Contract verification script
5. frontend/app/layout.tsx - Next.js layout with providers
6. frontend/app/page.tsx - Main dashboard page
7. frontend/app/globals.css - Tailwind styles
8. frontend/components/WalletConnect.tsx - RainbowKit integration
9. frontend/components/TokenBalance.tsx - Balance display
10. frontend/components/TokenInfo.tsx - Token information
11. frontend/lib/contracts.ts - Contract ABI and address
12. frontend/lib/wagmi.ts - Wagmi configuration
13. frontend/package.json - Frontend dependencies
14. config/networks.json - Network configurations
15. .env.example - Environment variables template
16. package.json - Root project configuration
17. README.md - Complete setup and usage instructions

IMPORTANT GUIDELINES:
1. Generate ALL files from the ${isTier2 ? 'TIER 2 advanced platform' : 'TIER 1 basic'} template structure
2. Use exact file structure and naming conventions
3. Include comprehensive setup instructions in README
4. Add proper TypeScript types and interfaces
5. Implement modern React patterns with hooks
6. Ensure wallet integration is production-ready
7. Include multi-network deployment support
8. Add proper error handling and loading states
9. Make UI responsive and accessible
10. Include environment variable examples
11. ${isTier2 ? 'Add backend API with authentication and database integration' : 'Add deployment and verification scripts'}
12. ${isTier2 ? 'Implement vesting schedule management system' : 'Ensure wallet integration is production-ready'}
13. ${isTier2 ? 'Include Docker configuration for development environment' : 'Follow security best practices throughout'}
14. ${isTier2 ? 'Add comprehensive analytics and transaction tracking' : 'Include comprehensive comments in complex logic'}
15. ${isTier2 ? 'Implement role-based access control and session management' : 'Ensure all imports and dependencies are correct'}
16. Make the project immediately runnable after setup

Start generating the complete ${isTier2 ? 'TIER 2 advanced token platform' : 'TIER 1 basic token + dApp'} project now. Return ONLY the JSON object, no additional text.`;

    return prompt;
  }

  private async generateWithOpenAI(prompt: string): Promise<AIGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Solana dApp developer specializing in Next.js and TypeScript. You generate complete, production-ready code.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      const result = JSON.parse(response);
      const totalLines = this.calculateTotalLines(result.files);

      return {
        files: result.files,
        packageJson: result.packageJson,
        readme: result.readme,
        totalFiles: result.files.length,
        totalLines,
        tokensUsed: completion.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  private async generateWithAnthropic(prompt: string): Promise<AIGenerationResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.7,
        system: 'You are an expert Solana dApp developer specializing in Next.js and TypeScript. You generate complete, production-ready code. Always respond with valid JSON.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      const result = JSON.parse(content.text);
      const totalLines = this.calculateTotalLines(result.files);

      return {
        files: result.files,
        packageJson: result.packageJson,
        readme: result.readme,
        totalFiles: result.files.length,
        totalLines,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      };
    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw error;
    }
  }

  private calculateTotalLines(files: GeneratedFile[]): number {
    return files.reduce((total, file) => {
      return total + file.content.split('\n').length;
    }, 0);
  }

  async analyzeCodeSecurity(files: GeneratedFile[]): Promise<{
    riskScore: number;
    flags: Array<{
      type: 'security' | 'legal' | 'content';
      severity: 'low' | 'medium' | 'high';
      message: string;
      file?: string;
      line?: number;
    }>;
  }> {
    const flags: any[] = [];
    let totalRisk = 0;

    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() detected', severity: 'high', risk: 30 },
      { pattern: /dangerouslySetInnerHTML/, message: 'Use of dangerouslySetInnerHTML detected', severity: 'medium', risk: 15 },
      { pattern: /process\.env\.[A-Z_]+(?!NEXT_PUBLIC)/, message: 'Server-side env var used in client code', severity: 'high', risk: 25 },
      { pattern: /localStorage\.setItem.*privateKey|secretKey/, message: 'Potential private key storage in localStorage', severity: 'high', risk: 40 },
      { pattern: /Math\.random\(\).*crypto|private|key/, message: 'Insecure random number generation for crypto', severity: 'high', risk: 35 },
      { pattern: /\.innerHTML\s*=/, message: 'Direct innerHTML manipulation', severity: 'medium', risk: 10 },
    ];

    for (const file of files) {
      const lines = file.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const { pattern, message, severity, risk } of securityPatterns) {
          if (pattern.test(line)) {
            flags.push({
              type: 'security',
              severity,
              message,
              file: file.path,
              line: i + 1,
            });
            totalRisk += risk;
          }
        }
      }
    }

    const riskScore = Math.min(100, totalRisk);

    return {
      riskScore,
      flags,
    };
  }
}

export default new AIService();
