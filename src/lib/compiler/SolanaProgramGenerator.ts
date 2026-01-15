import { ProjectConfig } from './types';

export class SolanaProgramGenerator {
  constructor(private config: ProjectConfig) {}

  generateTokenProgram(): string {
    const { token } = this.config;
    
    return `use anchor_lang::prelude::*;

declare_id!("${this.generateProgramId()}");

#[program]
pub mod ${token.symbol.toLowerCase()}_token {
    use super::*;

    pub fn initialize_token(ctx: Context<InitializeToken>) -> Result<()> {
        let token = &mut ctx.accounts.token;
        token.mint_authority = ctx.accounts.mint_authority.key();
        token.supply = 0;
        token.decimals = ${token.decimals};
        token.name = "${token.name}".to_string();
        token.symbol = "${token.symbol}".to_string();
        token.uri = "https://example.com".to_string();
        
        msg!("Token initialized: {}", token.symbol);
        Ok(())
    }

    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        let token = &mut ctx.accounts.token;
        let to = &mut ctx.accounts.to;
        
        token.supply += amount;
        to.amount += amount;
        
        msg!("Minted {} tokens to {}", amount, to.owner);
        Ok(())
    }

    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        require!(from.amount >= amount, ErrorCode::InsufficientFunds);
        
        from.amount -= amount;
        to.amount += amount;
        
        msg!("Transferred {} tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = mint_authority,
        space = 8 + TokenAccount::INIT_SPACE
    )]
    pub token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub mint_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
}

#[account]
pub struct TokenAccount {
    pub mint_authority: Pubkey,
    pub supply: u64,
    pub decimals: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

impl TokenAccount {
    pub const INIT_SPACE: usize = 32 // discriminator
        + 32 // mint_authority
        + 8  // supply
        + 1  // decimals
        + 4  // name string len
        + 50 // max name length
        + 4  // symbol string len  
        + 10 // max symbol length
        + 4  // uri string len
        + 100; // max uri length
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
}`;
  }

  generateStakingProgram(): string {
    return `use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};

declare_id!("${this.generateProgramId()}");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize_staking_pool(
        ctx: Context<InitializeStakingPool>,
        reward_per_epoch: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.authority = ctx.accounts.authority.key();
        pool.reward_token_mint = ctx.accounts.reward_token_mint.key();
        pool.staked_token_mint = ctx.accounts.staked_token_mint.key();
        pool.reward_per_epoch = reward_per_epoch;
        pool.total_staked = 0;
        pool.last_reward_epoch = 0;
        
        msg!("Staking pool initialized");
        Ok(())
    }

    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        // Transfer tokens to pool
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = anchor_spl::token::Transfer::new(cpi_accounts, cpi_program);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        
        // Update user stake
        user_stake.amount += amount;
        user_stake.user = ctx.accounts.user.key();
        user_stake.pool = ctx.accounts.staking_pool.key();
        user_stake.start_epoch = Clock::get()?.epoch;
        
        pool.total_staked += amount;
        
        msg!("Staked {} tokens", amount);
        Ok(())
    }

    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(user_stake.amount >= amount, ErrorCode::InsufficientStake);
        
        // Calculate rewards
        let epochs_staked = Clock::get()?.epoch - user_stake.start_epoch;
        let rewards = epochs_staked * pool.reward_per_epoch * amount / 1_000_000;
        
        // Transfer staked tokens back
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = anchor_spl::token::Transfer::new(cpi_accounts, cpi_program);
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        
        // Transfer rewards
        if rewards > 0 {
            let reward_cpi_accounts = anchor_spl::token::Transfer {
                from: ctx.accounts.pool_reward_account.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: ctx.accounts.staking_pool.to_account_info(),
            };
            let reward_cpi_ctx = anchor_spl::token::Transfer::new(reward_cpi_accounts, cpi_program);
            anchor_spl::token::transfer(reward_cpi_ctx, rewards)?;
        }
        
        // Update user stake
        user_stake.amount -= amount;
        pool.total_staked -= amount;
        
        msg!("Unstaked {} tokens with {} rewards", amount, rewards);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeStakingPool<'info> {
    #[account(init, payer = authority, space = 8 + StakingPool::INIT_SPACE)]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub reward_token_mint: Account<'info, Mint>,
    pub staked_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_reward_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub reward_token_mint: Pubkey,
    pub staked_token_mint: Pubkey,
    pub reward_per_epoch: u64,
    pub total_staked: u64,
    pub last_reward_epoch: u64,
}

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub start_epoch: u64,
}

impl StakingPool {
    pub const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8;
}

impl UserStake {
    pub const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient stake")]
    InsufficientStake,
}`;
  }

  generateAnchorToml(): string {
    return `[toolchain]

[features]
resolution = true
skip-lint = false

[programs.localnet]
${this.config.token.symbol.toLowerCase()}_token = "${this.generateProgramId()}"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json tests/**/*.ts"
`;
  }

  generateCargoToml(): string {
    return `[package]
name = "${this.config.token.symbol.toLowerCase()}-token"
version = "0.1.0"
description = "Solana token program for ${this.config.token.name}"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"

[dev-dependencies]
solana-program-test = "1.17.0"
tokio = { version = "1.35.0", features = ["full"] }
`;
  }

  generateDeployScript(): string {
    const { token } = this.config;
    
    return `#!/usr/bin/env ts-node

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  Program, 
  AnchorProvider, 
  Wallet,
  setProvider,
} from '@coral-xyz/anchor';
import { IDL } from './target/types/${token.symbol.toLowerCase()}_token';

// Configuration
const PROGRAM_ID = new PublicKey('${this.generateProgramId()}');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const DEPLOYER_KEYPAIR = new Keypair(); // Load from file in production

async function main() {
  // Setup connection
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = new Wallet(DEPLOYER_KEYPAIR);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  setProvider(provider);

  // Create program instance
  const program = new Program(IDL, PROGRAM_ID, provider);

  try {
    console.log('🚀 Deploying ${token.name} (${token.symbol}) token program...');
    
    // Initialize token
    const tokenKeypair = Keypair.generate();
    
    const tx = await program.methods
      .initializeToken()
      .accounts({
        token: tokenKeypair.publicKey,
        mintAuthority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([tokenKeypair])
      .rpc();

    console.log('✅ Token initialized successfully!');
    console.log('📍 Token Address:', tokenKeypair.publicKey.toString());
    console.log('🔗 Transaction:', tx);
    console.log('📊 Token Details:');
    console.log('   Name: ${token.name}');
    console.log('   Symbol: ${token.symbol}');
    console.log('   Decimals: ${token.decimals}');
    console.log('   Total Supply: ${token.supply.toLocaleString()}');

    // Mint initial supply to deployer
    const mintTx = await program.methods
      .mintTokens(new BN(${token.supply}))
      .accounts({
        token: tokenKeypair.publicKey,
        to: await getOrCreateAssociatedTokenAccount(
          connection,
          DEPLOYER_KEYPAIR,
          tokenKeypair.publicKey,
          provider.wallet.publicKey
        ),
        mintAuthority: provider.wallet.publicKey,
      })
      .rpc();

    console.log('💰 Initial supply minted!');
    console.log('🔗 Mint Transaction:', mintTx);

    // Save deployment info
    const deploymentInfo = {
      programId: PROGRAM_ID.toString(),
      tokenAddress: tokenKeypair.publicKey.toString(),
      mintAuthority: provider.wallet.publicKey.toString(),
      name: '${token.name}',
      symbol: '${token.symbol}',
      decimals: ${token.decimals},
      totalSupply: ${token.supply},
      network: connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet',
      deployedAt: new Date().toISOString(),
      transactions: {
        initialization: tx,
        mint: mintTx,
      }
    };

    // Save to file
    import * as fs from 'fs';
    fs.writeFileSync(
      './deployment.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('📁 Deployment info saved to deployment.json');
    console.log('🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Helper function
async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  // Implementation would go here
  // For now, return a placeholder
  return new PublicKey('11111111111111111111111111111111');
}

main().catch(console.error);
`;
  }

  private generateProgramId(): string {
    // Generate a deterministic program ID based on token symbol
    const seed = this.config.token.symbol + this.config.project.name;
    const hash = require('crypto').createHash('sha256').update(seed).digest('hex');
    return hash.substring(0, 44) + '11111111'; // Make it valid Solana address format
  }
}
