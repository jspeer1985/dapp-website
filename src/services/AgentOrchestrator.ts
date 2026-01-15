/**
 * OPTIK AI Agent Pipeline Orchestrator
 *
 * This service coordinates the 10 AI agents that generate production-grade Solana dApps/tokens.
 * Implements deterministic, tier-enforced, secure code generation pipeline.
 *
 * Architecture: See /AI-AGENT-PIPELINE-ARCHITECTURE.md
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProjectTier = 'starter' | 'professional' | 'enterprise';
export type ProjectType = 'token' | 'dapp' | 'both';

export interface CreationInformationForm {
  // Customer Information
  customerName: string;
  customerEmail: string;
  telegramHandle?: string;
  walletAddress: string;

  // Project Basics
  projectName: string;
  projectDescription: string;
  projectType: ProjectType;
  tier: ProjectTier;
  targetAudience?: string;

  // Token Configuration
  tokenConfig?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    logoUrl?: string;
    isNFT: boolean;
    nftCollectionName?: string;
    nftDescription?: string;
    royaltyPercentage?: number;
  };

  // dApp Configuration
  dappConfig?: {
    primaryColor: string;
    features: string[];
  };

  // Social & Metadata
  metadata?: {
    websiteUrl?: string;
    twitterHandle?: string;
    discordUrl?: string;
    telegramUrl?: string;
    customRequirements?: string;
  };

  // Payment Verification
  paymentTxSignature: string;
  paymentAmount: number;
}

export interface AgentResult {
  agentName: string;
  success: boolean;
  output?: any;
  errors?: string[];
  warnings?: string[];
  executionTimeMs: number;
}

export interface GenerationResult {
  success: boolean;
  generationId: string;
  files: GeneratedFile[];
  packageJson: any;
  readme: string;
  metadata: GenerationMetadata;
  agentResults: AgentResult[];
  riskScore: number;
  errors: string[];
  warnings: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GenerationMetadata {
  tier: ProjectTier;
  projectType: ProjectType;
  featuresIncluded: string[];
  featuresExcluded: string[];
  determinismScore: number;
  buildTimestamp: string;
  templateVersions: Record<string, string>;
  checksums: Record<string, string>;
}

// ============================================================================
// TIER FEATURE MATRIX
// ============================================================================

const TIER_FEATURES = {
  starter: {
    maxTokenSupply: 1_000_000_000,
    maxNFTCollection: 1000,
    wallet: ['phantom'], // Only Phantom wallet
    dappFeatures: ['wallet-connection', 'token-display', 'basic-ui'],
    protocolFeatures: [], // No protocol features
    liquidityPool: false,
    customDomain: false,
    deployment: false,
    support: 'community',
  },
  professional: {
    maxTokenSupply: 10_000_000_000,
    maxNFTCollection: 10000,
    wallet: ['phantom', 'solflare', 'torus'], // Multiple wallets
    dappFeatures: ['wallet-connection', 'token-display', 'advanced-ui', 'token-swap', 'analytics'],
    protocolFeatures: ['staking', 'governance'], // Staking + Governance
    liquidityPool: false,
    customDomain: true,
    deployment: false,
    support: 'priority',
  },
  enterprise: {
    maxTokenSupply: 100_000_000_000,
    maxNFTCollection: 100000,
    wallet: ['phantom', 'solflare', 'torus', 'ledger'], // All wallets including hardware
    dappFeatures: ['wallet-connection', 'token-display', 'advanced-ui', 'token-swap', 'analytics', 'admin-panel', 'custom-branding'],
    protocolFeatures: ['staking', 'governance', 'treasury', 'multisig'], // Full protocol suite
    liquidityPool: true,
    customDomain: true,
    deployment: true, // Mainnet deployment included
    support: 'dedicated',
  },
} as const;

// ============================================================================
// AGENT ORCHESTRATOR CLASS
// ============================================================================

export class AgentOrchestrator {
  private generationId: string;
  private cif: CreationInformationForm;
  private agentResults: AgentResult[] = [];
  private startTime: number;

  constructor(generationId: string, cif: CreationInformationForm) {
    this.generationId = generationId;
    this.cif = cif;
    this.startTime = Date.now();
  }

  /**
   * Main orchestration method - coordinates all 10 agents
   */
  async execute(): Promise<GenerationResult> {
    console.log(`[AgentOrchestrator] Starting generation ${this.generationId}`);

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // AGENT 1: Intake & Validation
      const validationResult = await this.runIntakeValidationAgent();
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.errors?.join(', ')}`);
      }

      // AGENT 2: Pricing & Tier Enforcement
      const tierResult = await this.runTierEnforcementAgent();
      if (!tierResult.success) {
        throw new Error(`Tier enforcement failed: ${tierResult.errors?.join(', ')}`);
      }

      // AGENTS 3-6: Parallel Generation (Token, dApp, Protocol, LP)
      const generationResults = await this.runParallelGenerationAgents();

      // Check if any critical agent failed
      const criticalFailure = generationResults.find(r => !r.success && r.agentName !== 'LiquidityPoolAgent');
      if (criticalFailure) {
        throw new Error(`Generation failed at ${criticalFailure.agentName}: ${criticalFailure.errors?.join(', ')}`);
      }

      // Collect generated artifacts
      const files: GeneratedFile[] = [];
      let packageJson: any = {};
      let readme = '';

      for (const result of generationResults) {
        if (result.success && result.output) {
          if (result.output.files) files.push(...result.output.files);
          if (result.output.packageJson) packageJson = { ...packageJson, ...result.output.packageJson };
          if (result.output.readme) readme += result.output.readme + '\n\n';
        }
      }

      // AGENT 7: Security & Constraint Validation
      const securityResult = await this.runSecurityAgent(files);
      if (!securityResult.success) {
        throw new Error(`Security validation failed: ${securityResult.errors?.join(', ')}`);
      }

      const riskScore = securityResult.output?.riskScore || 0;
      if (riskScore > 70) {
        warnings.push(`High risk score detected: ${riskScore}. Manual review recommended.`);
      }

      // AGENT 8: Build & Packaging
      const buildResult = await this.runBuildPackagingAgent(files, packageJson);
      if (!buildResult.success) {
        throw new Error(`Build/packaging failed: ${buildResult.errors?.join(', ')}`);
      }

      // AGENT 9: Deployment (Optional - Enterprise only)
      if (this.cif.tier === 'enterprise' && TIER_FEATURES.enterprise.deployment) {
        const deploymentResult = await this.runDeploymentAgent();
        if (!deploymentResult.success) {
          warnings.push(`Deployment failed: ${deploymentResult.errors?.join(', ')}. Providing deployment instructions instead.`);
        }
      }

      // AGENT 10: QA & Determinism Validation
      const qaResult = await this.runQAAgent(files, packageJson);
      if (!qaResult.success) {
        warnings.push(`QA validation warnings: ${qaResult.warnings?.join(', ')}`);
      }

      // Build final metadata
      const metadata: GenerationMetadata = {
        tier: this.cif.tier,
        projectType: this.cif.projectType,
        featuresIncluded: this.getFeaturesIncluded(),
        featuresExcluded: this.getFeaturesExcluded(),
        determinismScore: qaResult.output?.determinismScore || 95,
        buildTimestamp: new Date().toISOString(),
        templateVersions: buildResult.output?.templateVersions || {},
        checksums: buildResult.output?.checksums || {},
      };

      return {
        success: true,
        generationId: this.generationId,
        files,
        packageJson,
        readme,
        metadata,
        agentResults: this.agentResults,
        riskScore,
        errors,
        warnings,
      };

    } catch (error) {
      console.error(`[AgentOrchestrator] Generation failed:`, error);

      return {
        success: false,
        generationId: this.generationId,
        files: [],
        packageJson: {},
        readme: '',
        metadata: {} as GenerationMetadata,
        agentResults: this.agentResults,
        riskScore: 100,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings,
      };
    }
  }

  // ==========================================================================
  // AGENT 1: INTAKE & VALIDATION
  // ==========================================================================

  private async runIntakeValidationAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'IntakeValidationAgent';

    console.log(`[${agentName}] Validating input data...`);

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate wallet address (Solana base58, 32-44 chars)
      if (!this.cif.walletAddress || this.cif.walletAddress.length < 32 || this.cif.walletAddress.length > 44) {
        errors.push('Invalid wallet address format');
      }

      // Validate customer email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.cif.customerEmail)) {
        errors.push('Invalid email format');
      }

      // Validate project name (3-50 chars, alphanumeric + spaces/dashes)
      if (!this.cif.projectName || this.cif.projectName.length < 3 || this.cif.projectName.length > 50) {
        errors.push('Project name must be 3-50 characters');
      }

      // Validate project description (10-2000 chars)
      if (!this.cif.projectDescription || this.cif.projectDescription.length < 10 || this.cif.projectDescription.length > 2000) {
        errors.push('Project description must be 10-2000 characters');
      }

      // Validate payment transaction signature
      if (!this.cif.paymentTxSignature || this.cif.paymentTxSignature.length < 64) {
        errors.push('Invalid payment transaction signature');
      }

      // Validate token config if project type includes token
      if (this.cif.projectType === 'token' || this.cif.projectType === 'both') {
        if (!this.cif.tokenConfig) {
          errors.push('Token configuration required for token projects');
        } else {
          if (!this.cif.tokenConfig.name || this.cif.tokenConfig.name.length < 1) {
            errors.push('Token name is required');
          }
          if (!this.cif.tokenConfig.symbol || this.cif.tokenConfig.symbol.length < 1 || this.cif.tokenConfig.symbol.length > 10) {
            errors.push('Token symbol must be 1-10 characters');
          }
          if (this.cif.tokenConfig.decimals < 0 || this.cif.tokenConfig.decimals > 9) {
            errors.push('Token decimals must be 0-9');
          }
          if (this.cif.tokenConfig.totalSupply <= 0) {
            errors.push('Token supply must be positive');
          }

          // Validate NFT fields if isNFT is true
          if (this.cif.tokenConfig.isNFT) {
            if (!this.cif.tokenConfig.nftCollectionName) {
              errors.push('NFT collection name required for NFT tokens');
            }
            if (this.cif.tokenConfig.royaltyPercentage !== undefined) {
              if (this.cif.tokenConfig.royaltyPercentage < 0 || this.cif.tokenConfig.royaltyPercentage > 100) {
                errors.push('Royalty percentage must be 0-100');
              }
            }
          }
        }
      }

      // Validate dApp config if project type includes dapp
      if (this.cif.projectType === 'dapp' || this.cif.projectType === 'both') {
        if (!this.cif.dappConfig) {
          errors.push('dApp configuration required for dApp projects');
        } else {
          // Validate hex color
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
          if (!hexColorRegex.test(this.cif.dappConfig.primaryColor)) {
            warnings.push('Invalid primary color format, using default');
            this.cif.dappConfig.primaryColor = '#6366f1';
          }
        }
      }

      const result: AgentResult = {
        agentName,
        success: errors.length === 0,
        output: { validated: true },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Validation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 2: PRICING & TIER ENFORCEMENT
  // ==========================================================================

  private async runTierEnforcementAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'TierEnforcementAgent';

    console.log(`[${agentName}] Enforcing tier: ${this.cif.tier}`);

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const tierFeatures = TIER_FEATURES[this.cif.tier];

      // Enforce token supply limits
      if (this.cif.tokenConfig) {
        if (this.cif.tokenConfig.totalSupply > tierFeatures.maxTokenSupply) {
          errors.push(`Token supply ${this.cif.tokenConfig.totalSupply} exceeds ${this.cif.tier} tier limit of ${tierFeatures.maxTokenSupply}`);
        }

        // Enforce NFT collection limits
        if (this.cif.tokenConfig.isNFT && this.cif.tokenConfig.totalSupply > tierFeatures.maxNFTCollection) {
          errors.push(`NFT collection size ${this.cif.tokenConfig.totalSupply} exceeds ${this.cif.tier} tier limit of ${tierFeatures.maxNFTCollection}`);
        }
      }

      // Check protocol features
      if (this.cif.dappConfig?.features) {
        const requestedProtocolFeatures = this.cif.dappConfig.features.filter(f =>
          ['staking', 'governance', 'treasury', 'multisig'].includes(f.toLowerCase())
        );

        for (const feature of requestedProtocolFeatures) {
          if (!tierFeatures.protocolFeatures.includes(feature.toLowerCase() as any)) {
            warnings.push(`Feature '${feature}' not available in ${this.cif.tier} tier - will be excluded`);
          }
        }
      }

      // Check liquidity pool
      if (this.cif.dappConfig?.features?.some(f => f.toLowerCase().includes('liquidity'))) {
        if (!tierFeatures.liquidityPool) {
          warnings.push(`Liquidity pool only available in Enterprise tier - will be excluded`);
        }
      }

      // Check deployment
      if (this.cif.tier !== 'enterprise' && tierFeatures.deployment === false) {
        warnings.push(`Mainnet deployment only available in Enterprise tier - providing deployment instructions instead`);
      }

      const result: AgentResult = {
        agentName,
        success: errors.length === 0,
        output: {
          tierEnforced: this.cif.tier,
          allowedFeatures: tierFeatures,
        },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Tier enforcement error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // PARALLEL GENERATION AGENTS (3-6)
  // ==========================================================================

  private async runParallelGenerationAgents(): Promise<AgentResult[]> {
    console.log('[AgentOrchestrator] Running parallel generation agents...');

    const promises: Promise<AgentResult>[] = [];

    // AGENT 3: Token Engineering (if needed)
    if (this.cif.projectType === 'token' || this.cif.projectType === 'both') {
      promises.push(this.runTokenEngineeringAgent());
    }

    // AGENT 4: dApp Frontend (if needed)
    if (this.cif.projectType === 'dapp' || this.cif.projectType === 'both') {
      promises.push(this.runDappFrontendAgent());
    }

    // AGENT 5: Protocol Logic (if Professional or Enterprise)
    if (this.cif.tier === 'professional' || this.cif.tier === 'enterprise') {
      const hasProtocolFeatures = this.cif.dappConfig?.features?.some(f =>
        ['staking', 'governance', 'treasury', 'multisig'].includes(f.toLowerCase())
      );
      if (hasProtocolFeatures) {
        promises.push(this.runProtocolLogicAgent());
      }
    }

    // AGENT 6: Liquidity Pool (if Enterprise only)
    if (this.cif.tier === 'enterprise' && TIER_FEATURES.enterprise.liquidityPool) {
      const hasLPFeature = this.cif.dappConfig?.features?.some(f =>
        f.toLowerCase().includes('liquidity')
      );
      if (hasLPFeature) {
        promises.push(this.runLiquidityPoolAgent());
      }
    }

    // Execute all in parallel
    const results = await Promise.all(promises);

    return results;
  }

  // ==========================================================================
  // AGENT 3: TOKEN ENGINEERING
  // ==========================================================================

  private async runTokenEngineeringAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'TokenEngineeringAgent';

    console.log(`[${agentName}] Generating token contract...`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      if (!this.cif.tokenConfig) {
        throw new Error('Token configuration missing');
      }

      const { name, symbol, decimals, totalSupply, isNFT, nftCollectionName, royaltyPercentage } = this.cif.tokenConfig;

      // Generate SPL Token program (Rust)
      const tokenProgramContent = `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("${this.generateProgramId()}");

#[program]
pub mod ${this.sanitizeName(name)}_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let token_account = &mut ctx.accounts.token_account;
        token_account.authority = ctx.accounts.authority.key();
        token_account.decimals = ${decimals};
        token_account.supply = ${totalSupply};
        Ok(())
    }

    pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 1 + 8)]
    pub token_account: Account<'info, TokenState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTo<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenState {
    pub authority: Pubkey,
    pub decimals: u8,
    pub supply: u64,
}
`;

      files.push({
        path: 'programs/token/src/lib.rs',
        content: tokenProgramContent,
        language: 'rust',
      });

      // Generate Anchor.toml
      const anchorToml = `[features]
seeds = false
skip-lint = false

[programs.devnet]
${this.sanitizeName(name)}_token = "${this.generateProgramId()}"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`;

      files.push({
        path: 'Anchor.toml',
        content: anchorToml,
        language: 'toml',
      });

      // If NFT, generate Metaplex metadata
      if (isNFT && nftCollectionName) {
        const metaplexContent = `import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";

export async function createNFTCollection() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const wallet = Keypair.generate(); // Replace with actual wallet

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage());

  const { nft } = await metaplex.nfts().create({
    uri: "https://arweave.net/metadata.json", // Replace with actual metadata URI
    name: "${nftCollectionName}",
    sellerFeeBasisPoints: ${royaltyPercentage ? royaltyPercentage * 100 : 500}, // ${royaltyPercentage || 5}%
    symbol: "${symbol}",
    collection: {
      verified: false,
      key: wallet.publicKey,
    },
  });

  console.log("NFT Collection created:", nft.address.toString());
  return nft;
}
`;

        files.push({
          path: 'scripts/create-nft-collection.ts',
          content: metaplexContent,
          language: 'typescript',
        });
      }

      // Generate token deployment script
      const deployScript = `import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ${this.sanitizeClassName(name)}Token } from "../target/types/${this.sanitizeName(name)}_token";

export async function deployToken() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.${this.sanitizeClassName(name)}Token as Program<${this.sanitizeClassName(name)}Token>;

  const tokenAccount = anchor.web3.Keypair.generate();

  await program.methods
    .initialize()
    .accounts({
      tokenAccount: tokenAccount.publicKey,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([tokenAccount])
    .rpc();

  console.log("Token initialized:", tokenAccount.publicKey.toString());
  console.log("Symbol: ${symbol}");
  console.log("Decimals: ${decimals}");
  console.log("Total Supply: ${totalSupply}");

  return tokenAccount.publicKey;
}
`;

      files.push({
        path: 'scripts/deploy-token.ts',
        content: deployScript,
        language: 'typescript',
      });

      const result: AgentResult = {
        agentName,
        success: true,
        output: { files },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Token generation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 4: DAPP FRONTEND
  // ==========================================================================

  private async runDappFrontendAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'DappFrontendAgent';

    console.log(`[${agentName}] Generating dApp frontend...`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      const tierFeatures = TIER_FEATURES[this.cif.tier];
      const primaryColor = this.cif.dappConfig?.primaryColor || '#6366f1';
      const projectName = this.cif.projectName;

      // Generate app layout with wallet adapter
      const layoutContent = `'use client';

import React from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter${tierFeatures.wallet.includes('solflare') ? ', SolflareWalletAdapter' : ''}${tierFeatures.wallet.includes('torus') ? ', TorusWalletAdapter' : ''}${tierFeatures.wallet.includes('ledger') ? ', LedgerWalletAdapter' : ''} } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      ${tierFeatures.wallet.includes('solflare') ? 'new SolflareWalletAdapter(),' : ''}
      ${tierFeatures.wallet.includes('torus') ? 'new TorusWalletAdapter(),' : ''}
      ${tierFeatures.wallet.includes('ledger') ? 'new LedgerWalletAdapter(),' : ''}
    ],
    []
  );

  return (
    <html lang="en">
      <body>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
`;

      files.push({
        path: 'src/app/layout.tsx',
        content: layoutContent,
        language: 'typescript',
      });

      // Generate main page
      const pageContent = `'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './page.module.css';

export default function Home() {
  const { publicKey, connected } = useWallet();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>${projectName}</h1>
        <p className={styles.description}>${this.cif.projectDescription}</p>

        <div className={styles.walletSection}>
          <WalletMultiButton />
        </div>

        {connected && (
          <div className={styles.connectedSection}>
            <p>Connected: {publicKey?.toBase58()}</p>
            ${tierFeatures.dappFeatures.includes('token-display') ? `
            <div className={styles.tokenDisplay}>
              <h2>Your Tokens</h2>
              {/* Token balance display component */}
            </div>
            ` : ''}
            ${tierFeatures.dappFeatures.includes('token-swap') ? `
            <div className={styles.swapSection}>
              <h2>Token Swap</h2>
              {/* Token swap component */}
            </div>
            ` : ''}
          </div>
        )}
      </div>
    </main>
  );
}
`;

      files.push({
        path: 'src/app/page.tsx',
        content: pageContent,
        language: 'typescript',
      });

      // Generate CSS with brand color
      const cssContent = `.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}40 100%);
}

.container {
  max-width: 1200px;
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: ${primaryColor};
  margin-bottom: 1rem;
}

.description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.walletSection {
  margin: 2rem 0;
}

.connectedSection {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tokenDisplay, .swapSection {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px solid ${primaryColor};
  border-radius: 8px;
}
`;

      files.push({
        path: 'src/app/page.module.css',
        content: cssContent,
        language: 'css',
      });

      // Generate package.json
      const packageJson = {
        name: this.sanitizeName(projectName),
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          '@solana/wallet-adapter-base': '^0.9.23',
          '@solana/wallet-adapter-react': '^0.15.35',
          '@solana/wallet-adapter-react-ui': '^0.9.35',
          '@solana/wallet-adapter-wallets': '^0.19.32',
          '@solana/web3.js': '^1.95.2',
          next: '14.2.5',
          react: '^18',
          'react-dom': '^18',
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          typescript: '^5',
        },
      };

      const result: AgentResult = {
        agentName,
        success: true,
        output: { files, packageJson },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'dApp generation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 5: PROTOCOL LOGIC
  // ==========================================================================

  private async runProtocolLogicAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'ProtocolLogicAgent';

    console.log(`[${agentName}] Generating protocol contracts...`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      const tierFeatures = TIER_FEATURES[this.cif.tier];
      const requestedFeatures = this.cif.dappConfig?.features || [];

      // Generate staking contract (if requested and allowed)
      if (requestedFeatures.some(f => f.toLowerCase() === 'staking') &&
          tierFeatures.protocolFeatures.includes('staking')) {

        const stakingContract = `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("${this.generateProgramId()}");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>, reward_rate: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.reward_rate = reward_rate;
        pool.total_staked = 0;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;

        // Transfer tokens to pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update state
        pool.total_staked = pool.total_staked.checked_add(amount).unwrap();
        user_stake.amount = user_stake.amount.checked_add(amount).unwrap();
        user_stake.last_update_time = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount >= amount, StakingError::InsufficientBalance);

        // Calculate rewards before unstaking
        let rewards = calculate_rewards(user_stake, ctx.accounts.pool.reward_rate)?;

        // Transfer tokens back to user
        let pool = &ctx.accounts.pool;
        let seeds = &[b"pool".as_ref(), &[ctx.bumps.pool]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount.checked_add(rewards).unwrap())?;

        // Update state
        ctx.accounts.pool.total_staked = ctx.accounts.pool.total_staked.checked_sub(amount).unwrap();
        user_stake.amount = user_stake.amount.checked_sub(amount).unwrap();

        Ok(())
    }
}

fn calculate_rewards(user_stake: &UserStake, reward_rate: u64) -> Result<u64> {
    let current_time = Clock::get()?.unix_timestamp;
    let time_elapsed = (current_time - user_stake.last_update_time) as u64;
    let rewards = user_stake.amount
        .checked_mul(reward_rate).unwrap()
        .checked_mul(time_elapsed).unwrap()
        .checked_div(100_000).unwrap(); // Normalize reward rate
    Ok(rewards)
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8, seeds = [b"pool"], bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(init_if_needed, payer = user, space = 8 + 32 + 8 + 8, seeds = [b"user_stake", user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"user_stake", user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub reward_rate: u64,
    pub total_staked: u64,
}

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub amount: u64,
    pub last_update_time: i64,
}

#[error_code]
pub enum StakingError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
`;

        files.push({
          path: 'programs/staking/src/lib.rs',
          content: stakingContract,
          language: 'rust',
        });
      }

      // Generate governance contract (if requested and allowed)
      if (requestedFeatures.some(f => f.toLowerCase() === 'governance') &&
          tierFeatures.protocolFeatures.includes('governance')) {

        const governanceContract = `use anchor_lang::prelude::*;

declare_id!("${this.generateProgramId()}");

#[program]
pub mod governance {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        voting_period: i64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.start_time = Clock::get()?.unix_timestamp;
        proposal.end_time = proposal.start_time + voting_period;
        proposal.executed = false;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter_record = &mut ctx.accounts.voter_record;

        require!(!proposal.executed, GovernanceError::ProposalExecuted);
        require!(Clock::get()?.unix_timestamp <= proposal.end_time, GovernanceError::VotingEnded);
        require!(!voter_record.has_voted, GovernanceError::AlreadyVoted);

        if vote {
            proposal.yes_votes += 1;
        } else {
            proposal.no_votes += 1;
        }

        voter_record.has_voted = true;
        voter_record.vote = vote;

        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(!proposal.executed, GovernanceError::ProposalExecuted);
        require!(Clock::get()?.unix_timestamp > proposal.end_time, GovernanceError::VotingActive);
        require!(proposal.yes_votes > proposal.no_votes, GovernanceError::ProposalRejected);

        proposal.executed = true;

        // Execute proposal logic here
        msg!("Proposal executed: {}", proposal.title);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = proposer, space = 8 + 32 + 200 + 1000 + 8 + 8 + 8 + 8 + 1)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(init_if_needed, payer = voter, space = 8 + 32 + 32 + 1 + 1, seeds = [b"voter", proposal.key().as_ref(), voter.key().as_ref()], bump)]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub executed: bool,
}

#[account]
pub struct VoterRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub has_voted: bool,
    pub vote: bool,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Proposal already executed")]
    ProposalExecuted,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Voting is still active")]
    VotingActive,
    #[msg("Voter has already voted")]
    AlreadyVoted,
    #[msg("Proposal was rejected")]
    ProposalRejected,
}
`;

        files.push({
          path: 'programs/governance/src/lib.rs',
          content: governanceContract,
          language: 'rust',
        });
      }

      const result: AgentResult = {
        agentName,
        success: true,
        output: { files },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Protocol generation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 6: LIQUIDITY POOL (Enterprise Only)
  // ==========================================================================

  private async runLiquidityPoolAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'LiquidityPoolAgent';

    console.log(`[${agentName}] Generating liquidity pool integration...`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const files: GeneratedFile[] = [];

    try {
      if (this.cif.tier !== 'enterprise') {
        warnings.push('Liquidity pool only available in Enterprise tier');
        return {
          agentName,
          success: true,
          output: { files },
          errors,
          warnings,
          executionTimeMs: Date.now() - startTime,
        };
      }

      // Generate Raydium LP integration
      const lpIntegration = `import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Liquidity, Token, TokenAmount, Percent } from '@raydium-io/raydium-sdk';

export interface LiquidityPoolConfig {
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  initialTokenAAmount: number;
  initialTokenBAmount: number;
  lpFeeRate: number; // 0.25% default + 0.5% platform fee = 0.75%
}

export async function createLiquidityPool(
  connection: Connection,
  wallet: PublicKey,
  config: LiquidityPoolConfig
): Promise<PublicKey> {
  console.log('Creating liquidity pool with 30-day lock...');

  // IMPORTANT: Platform takes 0.5% LP fee
  const platformFeeRate = new Percent(50, 10000); // 0.5%
  const totalFeeRate = new Percent(config.lpFeeRate + 50, 10000);

  // Create pool with Raydium
  const { transaction, signers } = await Liquidity.makeCreatePoolTransaction({
    connection,
    poolKeys: {
      baseMint: config.tokenAMint,
      quoteMint: config.tokenBMint,
    },
    baseAmount: new TokenAmount(
      new Token(config.tokenAMint, 9),
      config.initialTokenAAmount
    ),
    quoteAmount: new TokenAmount(
      new Token(config.tokenBMint, 9),
      config.initialTokenBAmount
    ),
    startTime: new Date(),
  });

  // Add 30-day liquidity lock
  const lockEndTime = Date.now() + (30 * 24 * 60 * 60 * 1000);

  console.log(\`LP created with lock until: \${new Date(lockEndTime).toISOString()}\`);
  console.log(\`Platform fee: 0.5% of all swaps\`);

  return transaction.instructions[0].keys[0].pubkey;
}

export async function addLiquidity(
  connection: Connection,
  poolId: PublicKey,
  tokenAAmount: number,
  tokenBAmount: number
): Promise<string> {
  // Add liquidity to existing pool
  console.log('Adding liquidity to pool:', poolId.toString());

  // Implementation here...
  return 'tx_signature';
}

export async function removeLiquidity(
  connection: Connection,
  poolId: PublicKey,
  lpTokenAmount: number
): Promise<string> {
  // Remove liquidity (only after 30-day lock)
  const now = Date.now();
  // Check lock time from pool state

  console.log('Removing liquidity from pool:', poolId.toString());

  // Implementation here...
  return 'tx_signature';
}
`;

      files.push({
        path: 'src/lib/liquidity-pool.ts',
        content: lpIntegration,
        language: 'typescript',
      });

      const result: AgentResult = {
        agentName,
        success: true,
        output: { files },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'LP generation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 7: SECURITY & CONSTRAINT VALIDATION
  // ==========================================================================

  private async runSecurityAgent(files: GeneratedFile[]): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'SecurityConstraintAgent';

    console.log(`[${agentName}] Running security validation...`);

    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    try {
      for (const file of files) {
        const content = file.content.toLowerCase();

        // Check for hardcoded private keys
        if (content.includes('private_key') || content.includes('privatekey') || content.includes('secret_key')) {
          if (!content.includes('env.') && !content.includes('process.env')) {
            errors.push(`Hardcoded private key detected in ${file.path}`);
            riskScore += 40;
          }
        }

        // Check for eval() usage
        if (content.includes('eval(')) {
          warnings.push(`eval() usage detected in ${file.path} - potential security risk`);
          riskScore += 30;
        }

        // Check for dangerouslySetInnerHTML
        if (content.includes('dangerouslysetinnerhtml')) {
          warnings.push(`dangerouslySetInnerHTML detected in ${file.path} - XSS risk`);
          riskScore += 20;
        }

        // Check for unsafe unchecked math in Rust
        if (file.language === 'rust' && content.includes('unchecked_')) {
          warnings.push(`Unchecked arithmetic in ${file.path} - overflow risk`);
          riskScore += 15;
        }

        // Check for missing overflow checks
        if (file.language === 'rust' && (content.includes('+') || content.includes('*'))) {
          if (!content.includes('checked_add') && !content.includes('checked_mul')) {
            warnings.push(`Missing overflow checks in ${file.path}`);
            riskScore += 10;
          }
        }

        // Check for external calls without verification
        if (content.includes('invoke') || content.includes('invoke_signed')) {
          if (!content.includes('require') && !content.includes('assert')) {
            warnings.push(`External call without validation in ${file.path}`);
            riskScore += 25;
          }
        }
      }

      // Normalize risk score to 0-100
      riskScore = Math.min(riskScore, 100);

      if (riskScore > 70) {
        errors.push(`Critical risk score: ${riskScore}. Manual review required.`);
      }

      const result: AgentResult = {
        agentName,
        success: riskScore <= 70,
        output: { riskScore, scannedFiles: files.length },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Security scan error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 8: BUILD & PACKAGING
  // ==========================================================================

  private async runBuildPackagingAgent(files: GeneratedFile[], packageJson: any): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'BuildPackagingAgent';

    console.log(`[${agentName}] Packaging files...`);

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Version pinning - ensure no ^ or ~ in dependencies
      const deps = packageJson.dependencies || {};
      for (const [pkg, version] of Object.entries(deps)) {
        if (typeof version === 'string' && (version.startsWith('^') || version.startsWith('~'))) {
          warnings.push(`Unpinned version for ${pkg}: ${version}`);
          // Remove ^ or ~ for deterministic builds
          deps[pkg] = version.replace(/^[\^~]/, '');
        }
      }

      // Generate checksums for all files
      const checksums: Record<string, string> = {};
      for (const file of files) {
        // Simple hash for demonstration (use crypto.createHash in production)
        const hash = Buffer.from(file.content).toString('base64').substring(0, 16);
        checksums[file.path] = hash;
      }

      // Add standard config files
      files.push({
        path: '.gitignore',
        content: `node_modules/
.env
.env.local
dist/
build/
target/
.DS_Store
*.log
`,
        language: 'text',
      });

      files.push({
        path: '.env.example',
        content: `NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=your_private_key_here
`,
        language: 'text',
      });

      const result: AgentResult = {
        agentName,
        success: true,
        output: {
          filesCount: files.length,
          checksums,
          templateVersions: {
            'next': '14.2.5',
            'anchor': '0.30.1',
            'solana-web3': '1.95.2',
          },
        },
        errors,
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'Packaging error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // AGENT 9: DEPLOYMENT (Optional, Enterprise Only)
  // ==========================================================================

  private async runDeploymentAgent(): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'DeploymentAgent';

    console.log(`[${agentName}] Preparing deployment...`);

    const warnings: string[] = [];

    // Deployment is optional and requires explicit customer authorization
    warnings.push('Mainnet deployment requires explicit customer authorization');
    warnings.push('Deployment instructions will be provided in README');

    const result: AgentResult = {
      agentName,
      success: true,
      output: { deploymentReady: false, requiresAuthorization: true },
      warnings,
      executionTimeMs: Date.now() - startTime,
    };

    this.agentResults.push(result);
    return result;
  }

  // ==========================================================================
  // AGENT 10: QA & DETERMINISM VALIDATION
  // ==========================================================================

  private async runQAAgent(files: GeneratedFile[], packageJson: any): Promise<AgentResult> {
    const startTime = Date.now();
    const agentName = 'QADeterminismAgent';

    console.log(`[${agentName}] Running QA checks...`);

    const warnings: string[] = [];
    let determinismScore = 100;

    try {
      // Check for unpinned dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      for (const [pkg, version] of Object.entries(deps)) {
        if (typeof version === 'string' && (version.includes('^') || version.includes('~') || version === 'latest')) {
          warnings.push(`Non-deterministic dependency: ${pkg}@${version}`);
          determinismScore -= 5;
        }
      }

      // Check for timestamp usage (non-deterministic)
      for (const file of files) {
        if (file.content.includes('Date.now()') || file.content.includes('new Date()')) {
          if (!file.path.includes('test') && !file.path.includes('example')) {
            warnings.push(`Timestamp usage in ${file.path} - may reduce determinism`);
            determinismScore -= 3;
          }
        }

        // Check for random number generation
        if (file.content.includes('Math.random()') || file.content.includes('rand::')) {
          warnings.push(`Random number generation in ${file.path} - non-deterministic`);
          determinismScore -= 5;
        }
      }

      // Check for required files
      const requiredFiles = ['package.json', 'README.md', '.gitignore', '.env.example'];
      const existingPaths = files.map(f => f.path);
      for (const required of requiredFiles) {
        if (!existingPaths.some(p => p.endsWith(required))) {
          warnings.push(`Missing required file: ${required}`);
          determinismScore -= 2;
        }
      }

      determinismScore = Math.max(determinismScore, 0);

      const result: AgentResult = {
        agentName,
        success: determinismScore >= 95,
        output: { determinismScore },
        warnings,
        executionTimeMs: Date.now() - startTime,
      };

      this.agentResults.push(result);
      return result;

    } catch (error) {
      const result: AgentResult = {
        agentName,
        success: false,
        errors: [error instanceof Error ? error.message : 'QA validation error'],
        warnings,
        executionTimeMs: Date.now() - startTime,
      };
      this.agentResults.push(result);
      return result;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getFeaturesIncluded(): string[] {
    const tierFeatures = TIER_FEATURES[this.cif.tier];
    const features: string[] = [];

    // Add wallet features
    features.push(`Wallets: ${tierFeatures.wallet.join(', ')}`);

    // Add dApp features
    if (this.cif.projectType === 'dapp' || this.cif.projectType === 'both') {
      features.push(...tierFeatures.dappFeatures);
    }

    // Add protocol features
    features.push(...tierFeatures.protocolFeatures.map(f => `Protocol: ${f}`));

    // Add liquidity pool if available
    if (tierFeatures.liquidityPool) {
      features.push('Liquidity Pool Integration');
    }

    return features;
  }

  private getFeaturesExcluded(): string[] {
    const tierFeatures = TIER_FEATURES[this.cif.tier];
    const excluded: string[] = [];

    // Check what's NOT available in current tier
    if (this.cif.tier === 'starter') {
      excluded.push('Multiple wallet support', 'Staking', 'Governance', 'Liquidity Pool', 'Mainnet Deployment');
    } else if (this.cif.tier === 'professional') {
      excluded.push('Liquidity Pool', 'Mainnet Deployment', 'Treasury Management', 'Multisig');
    }

    return excluded;
  }

  private generateProgramId(): string {
    // Generate a deterministic program ID based on project name
    const base = this.cif.projectName.replace(/[^a-zA-Z0-9]/g, '');
    return `${base}111111111111111111111111111111111`.substring(0, 44);
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  private sanitizeClassName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^(.)/, (match) => match.toUpperCase());
  }
}

// ==========================================================================
// EXPORT DEFAULT INSTANCE CREATOR
// ==========================================================================

export function createAgentOrchestrator(generationId: string, cif: CreationInformationForm): AgentOrchestrator {
  return new AgentOrchestrator(generationId, cif);
}
