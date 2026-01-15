#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * Tests all required .env variables for the dApp platform
 */

require('dotenv').config({ path: '.env' });
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { MongoClient } = require('mongodb');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(message) {
  results.passed.push(message);
  log(`✓ ${message}`, 'green');
}

function fail(message) {
  results.failed.push(message);
  log(`✗ ${message}`, 'red');
}

function warn(message) {
  results.warnings.push(message);
  log(`⚠ ${message}`, 'yellow');
}

// Required variables
const REQUIRED_VARS = {
  // Solana
  'NEXT_PUBLIC_SOLANA_NETWORK': 'Solana network (devnet/mainnet-beta)',
  'NEXT_PUBLIC_SOLANA_RPC_URL': 'Solana RPC endpoint',
  'SOLANA_TREASURY_WALLET': 'Treasury wallet address',
  'SOLANA_TREASURY_PRIVATE_KEY': 'Treasury wallet private key',
  'NEXT_PUBLIC_SOLANA_TREASURY_WALLET': 'Public treasury wallet',

  // MongoDB
  'MONGODB_URI': 'MongoDB connection string',

  // AI
  'AI_PROVIDER': 'AI provider (openai/anthropic)',

  // Pricing
  'NEXT_PUBLIC_DAPP_STARTER_PRICE_SOL': 'DApp Starter tier price (SOL)',
  'NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_SOL': 'DApp Professional tier price (SOL)',
  'NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_SOL': 'DApp Enterprise tier price (SOL)',
  'NEXT_PUBLIC_TOKEN_STARTER_PRICE_SOL': 'Token Starter tier price (SOL)',
  'NEXT_PUBLIC_TOKEN_PROFESSIONAL_PRICE_SOL': 'Token Professional tier price (SOL)',
  'NEXT_PUBLIC_TOKEN_ENTERPRISE_PRICE_SOL': 'Token Enterprise tier price (SOL)',
};

async function checkEnvVariables() {
  header('1. Environment Variables Check');

  for (const [key, description] of Object.entries(REQUIRED_VARS)) {
    if (process.env[key]) {
      pass(`${key}: ${description}`);
    } else {
      fail(`${key}: Missing - ${description}`);
    }
  }

  // Check AI provider specific keys
  const provider = process.env.AI_PROVIDER;
  if (provider === 'openai') {
    if (process.env.OPENAI_API_KEY) {
      pass('OPENAI_API_KEY: Present');
    } else {
      fail('OPENAI_API_KEY: Missing (required for AI_PROVIDER=openai)');
    }
  } else if (provider === 'anthropic') {
    if (process.env.ANTHROPIC_API_KEY) {
      pass('ANTHROPIC_API_KEY: Present');
    } else {
      fail('ANTHROPIC_API_KEY: Missing (required for AI_PROVIDER=anthropic)');
    }
  }

  // Optional but recommended
  const optionalVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'MAX_GENERATION_SIZE_MB',
    'TEMP_FILE_RETENTION_HOURS',
  ];

  for (const key of optionalVars) {
    if (!process.env[key]) {
      warn(`${key}: Not set (optional but recommended)`);
    }
  }
}

async function checkSolanaConnection() {
  header('2. Solana RPC Connection Test');

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const connection = new Connection(rpcUrl, 'confirmed');

    // Test connection
    const version = await connection.getVersion();
    pass(`Connected to Solana ${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`);
    log(`  Version: ${JSON.stringify(version)}`, 'blue');

    // Check treasury wallet
    const treasuryPubkey = new PublicKey(process.env.SOLANA_TREASURY_WALLET);
    const balance = await connection.getBalance(treasuryPubkey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    pass(`Treasury wallet: ${process.env.SOLANA_TREASURY_WALLET}`);
    log(`  Balance: ${solBalance} SOL`, 'blue');

    if (solBalance < 1) {
      warn('Treasury balance is low. Fund it for refunds and token creation.');
    }

  } catch (error) {
    fail(`Solana RPC connection failed: ${error.message}`);
  }
}

async function checkPrivateKey() {
  header('3. Treasury Private Key Validation');

  try {
    const privateKeyEnv = process.env.SOLANA_TREASURY_PRIVATE_KEY;

    if (!privateKeyEnv) {
      fail('SOLANA_TREASURY_PRIVATE_KEY not set');
      return;
    }

    // Try to parse as JSON array
    let privateKeyArray;
    if (privateKeyEnv.startsWith('[')) {
      privateKeyArray = JSON.parse(privateKeyEnv);
    } else {
      // Try base58 decode
      const bs58 = require('bs58');
      privateKeyArray = bs58.decode(privateKeyEnv);
    }

    if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
      fail(`Private key has invalid length: ${privateKeyArray?.length || 0} (expected 64)`);
      return;
    }

    // Create keypair
    const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    const derivedAddress = keypair.publicKey.toBase58();

    pass('Private key format is valid');
    log(`  Derived address: ${derivedAddress}`, 'blue');

    // Check if it matches treasury wallet
    if (derivedAddress === process.env.SOLANA_TREASURY_WALLET) {
      pass('Private key matches SOLANA_TREASURY_WALLET');
    } else {
      fail(`Private key mismatch!\n  Derived: ${derivedAddress}\n  Expected: ${process.env.SOLANA_TREASURY_WALLET}`);
    }

  } catch (error) {
    fail(`Private key validation failed: ${error.message}`);
  }
}

async function checkMongoDB() {
  header('4. MongoDB Connection Test');

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      fail('MONGODB_URI not set');
      return;
    }

    log('Connecting to MongoDB...', 'blue');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    // Test database access
    const db = client.db();
    await db.admin().ping();

    pass(`Connected to MongoDB: ${db.databaseName}`);

    // List collections
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      log(`  Collections: ${collections.map(c => c.name).join(', ')}`, 'blue');
    } else {
      warn('No collections found (database is empty)');
    }

    await client.close();

  } catch (error) {
    fail(`MongoDB connection failed: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      warn('Make sure MongoDB is running: mongod');
    } else if (error.message.includes('authentication failed')) {
      warn('Check MongoDB credentials in MONGODB_URI');
    }
  }
}

async function checkAIKeys() {
  header('5. AI API Keys Check');

  const provider = process.env.AI_PROVIDER;

  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      if (key.startsWith('sk-') && key.length > 20) {
        pass('OpenAI API key format looks valid');
        log('  Testing API key requires a request (skipped)', 'blue');
      } else {
        warn('OpenAI API key format looks suspicious');
      }
    }
  } else if (provider === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      if (key.startsWith('sk-ant-') && key.length > 20) {
        pass('Anthropic API key format looks valid');
        log('  Testing API key requires a request (skipped)', 'blue');
      } else {
        warn('Anthropic API key format looks suspicious');
      }
    }
  } else {
    fail(`Invalid AI_PROVIDER: ${provider} (must be 'openai' or 'anthropic')`);
  }
}

async function printSummary() {
  header('Summary');

  console.log('');
  log(`✓ Passed: ${results.passed.length}`, 'green');
  log(`⚠ Warnings: ${results.warnings.length}`, 'yellow');
  log(`✗ Failed: ${results.failed.length}`, 'red');

  if (results.failed.length === 0) {
    console.log('');
    log('🎉 All critical checks passed!', 'green');
  } else {
    console.log('');
    log('❌ Some critical checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

async function main() {
  console.clear();
  log('\n🔍 dApp Environment Configuration Validator\n', 'magenta');

  await checkEnvVariables();
  await checkSolanaConnection();
  await checkPrivateKey();
  await checkMongoDB();
  await checkAIKeys();
  await printSummary();
}

main().catch(error => {
  console.error('\n');
  log(`Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
