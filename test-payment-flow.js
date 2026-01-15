#!/usr/bin/env node
/**
 * End-to-End Payment and Generation Test
 * Tests all three tiers: Starter, Professional, Enterprise
 */

require('dotenv').config({ path: '.env' });
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const bs58 = require('bs58');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(70));
  log(`${colors.bold}${title}`, 'cyan');
  console.log('='.repeat(70));
}

// Test configuration
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
const TREASURY_WALLET = new PublicKey(process.env.SOLANA_TREASURY_WALLET);

// Create test sender wallet (in production, this would be the user's wallet)
let testWallet;
try {
  // Try to load existing test wallet or create new one
  const fs = require('fs');
  const walletPath = '.test-wallet.json';

  if (fs.existsSync(walletPath)) {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    testWallet = Keypair.fromSecretKey(Uint8Array.from(walletData));
    log(`📝 Loaded existing test wallet: ${testWallet.publicKey.toBase58()}`, 'blue');
  } else {
    testWallet = Keypair.generate();
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(testWallet.secretKey)));
    log(`🆕 Created new test wallet: ${testWallet.publicKey.toBase58()}`, 'blue');
    log(`⚠️  Fund this wallet with devnet SOL: https://solfaucet.com`, 'yellow');
  }
} catch (error) {
  log(`Error with test wallet: ${error.message}`, 'red');
  process.exit(1);
}

const TIERS = [
  {
    name: 'Starter',
    tier: 'starter',
    price: parseFloat(process.env.NEXT_PUBLIC_STARTER_PRICE_SOL),
    features: 'Basic dApp with wallet integration',
  },
  {
    name: 'Professional',
    tier: 'professional',
    price: parseFloat(process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL),
    features: 'Advanced dApp with token creation',
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    price: parseFloat(process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_SOL),
    features: 'Full-featured dApp with analytics',
  },
];

const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function checkWalletBalance(connection, wallet) {
  const balance = await connection.getBalance(wallet.publicKey);
  return balance / LAMPORTS_PER_SOL;
}

async function airdropIfNeeded(connection, wallet, requiredSOL) {
  const balance = await checkWalletBalance(connection, wallet);

  if (balance < requiredSOL) {
    log(`💰 Balance too low (${balance} SOL). Requesting airdrop...`, 'yellow');
    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      log(`✓ Airdrop successful!`, 'green');

      const newBalance = await checkWalletBalance(connection, wallet);
      return newBalance;
    } catch (error) {
      log(`✗ Airdrop failed: ${error.message}`, 'red');
      log(`Please manually fund: ${wallet.publicKey.toBase58()}`, 'yellow');
      log(`Visit: https://solfaucet.com`, 'yellow');
      return balance;
    }
  }

  return balance;
}

async function createGeneration(tierConfig) {
  log(`\n📝 Creating generation record for ${tierConfig.name} tier...`, 'blue');

  try {
    const response = await axios.post(`${API_BASE}/api/generations/create`, {
      walletAddress: testWallet.publicKey.toBase58(),
      projectName: `Test ${tierConfig.name} Project`,
      projectDescription: `Automated test for ${tierConfig.name} tier. This is a comprehensive end-to-end test to verify payment processing and dApp generation functionality.`,
      projectType: 'dapp',
      tier: tierConfig.tier,
      features: [tierConfig.features],
    });

    if (response.data.success) {
      log(`✓ Generation created: ${response.data.generationId}`, 'green');
      return response.data;
    } else {
      throw new Error(response.data.error || 'Unknown error');
    }
  } catch (error) {
    log(`✗ Failed to create generation: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    throw error;
  }
}

async function sendPayment(connection, tierConfig, treasuryWallet) {
  log(`\n💸 Sending payment of ${tierConfig.price} SOL...`, 'blue');

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: testWallet.publicKey,
        toPubkey: treasuryWallet,
        lamports: Math.floor(tierConfig.price * LAMPORTS_PER_SOL),
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [testWallet],
      { commitment: 'confirmed' }
    );

    log(`✓ Payment sent! Transaction: ${signature}`, 'green');
    log(`  View: https://explorer.solana.com/tx/${signature}?cluster=devnet`, 'blue');

    return signature;
  } catch (error) {
    log(`✗ Payment failed: ${error.message}`, 'red');
    throw error;
  }
}

async function verifyPayment(generationId, txSignature) {
  log(`\n🔍 Verifying payment...`, 'blue');

  try {
    const response = await axios.post(`${API_BASE}/api/payments/verify`, {
      generationId,
      transactionSignature: txSignature,
    });

    if (response.data.success) {
      log(`✓ Payment verified successfully!`, 'green');
      log(`  Confirmations: ${response.data.confirmations || 0}`, 'blue');
      return true;
    } else {
      throw new Error(response.data.error || 'Payment not verified');
    }
  } catch (error) {
    log(`✗ Payment verification failed: ${error.message}`, 'red');
    throw error;
  }
}

async function triggerGeneration(generationId) {
  log(`\n🤖 Triggering AI generation...`, 'blue');

  try {
    const response = await axios.post(
      `${API_BASE}/api/generations/${generationId}/generate`
    );

    if (response.data.success) {
      log(`✓ Generation triggered successfully!`, 'green');
      log(`  Status: ${response.data.status}`, 'blue');

      if (response.data.requiresReview) {
        log(`  ⚠️  Requires manual review (risk score: ${response.data.riskScore})`, 'yellow');
      }

      return response.data;
    } else {
      throw new Error(response.data.error || 'Generation failed');
    }
  } catch (error) {
    log(`✗ Generation trigger failed: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    throw error;
  }
}

async function pollGenerationStatus(generationId, maxAttempts = 60) {
  log(`\n⏳ Polling generation status...`, 'blue');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${API_BASE}/api/generations/${generationId}`);
      const generation = response.data;

      if (generation.status === 'completed') {
        log(`✓ Generation completed successfully!`, 'green');
        return generation;
      } else if (generation.status === 'failed') {
        throw new Error(`Generation failed: ${generation.error}`);
      } else if (generation.status === 'review_required') {
        log(`⚠️  Generation requires admin review`, 'yellow');
        return generation;
      }

      process.stdout.write(`\r  Status: ${generation.status} (${i + 1}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      log(`\n✗ Error polling status: ${error.message}`, 'red');
      throw error;
    }
  }

  throw new Error('Generation timeout - exceeded max polling attempts');
}

async function testDownload(downloadToken, tierName) {
  log(`\n📥 Testing file download...`, 'blue');

  try {
    const response = await axios.get(
      `${API_BASE}/api/download/${downloadToken}`,
      { responseType: 'arraybuffer' }
    );

    const sizeKB = (response.data.length / 1024).toFixed(2);
    log(`✓ Download successful! File size: ${sizeKB} KB`, 'green');

    // Optionally save the file
    const fs = require('fs');
    const fileName = `test-${tierName}-${Date.now()}.zip`;
    fs.writeFileSync(fileName, response.data);
    log(`  Saved to: ${fileName}`, 'blue');

    return true;
  } catch (error) {
    log(`✗ Download failed: ${error.message}`, 'red');
    return false;
  }
}

async function testTier(connection, tierConfig) {
  header(`Testing ${tierConfig.name} Tier - $${tierConfig.price} SOL`);

  const testResult = {
    tier: tierConfig.name,
    passed: false,
    error: null,
    generationId: null,
    txSignature: null,
    downloadToken: null,
  };

  try {
    // Step 1: Check wallet balance
    log(`\n1️⃣  Checking wallet balance...`, 'cyan');
    const balance = await airdropIfNeeded(connection, testWallet, tierConfig.price + 0.01);
    log(`  Current balance: ${balance.toFixed(4)} SOL`, 'blue');

    if (balance < tierConfig.price) {
      throw new Error(`Insufficient balance. Need ${tierConfig.price} SOL, have ${balance} SOL`);
    }

    // Step 2: Create generation
    log(`\n2️⃣  Creating generation...`, 'cyan');
    const generationData = await createGeneration(tierConfig);
    testResult.generationId = generationData.generationId;

    // Step 3: Send payment
    log(`\n3️⃣  Sending payment...`, 'cyan');
    const txSignature = await sendPayment(connection, tierConfig, TREASURY_WALLET);
    testResult.txSignature = txSignature;

    // Wait for transaction confirmation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 4: Verify payment
    log(`\n4️⃣  Verifying payment...`, 'cyan');
    await verifyPayment(generationData.generationId, txSignature);

    // Step 5: Trigger generation
    log(`\n5️⃣  Triggering AI generation...`, 'cyan');
    const generateResult = await triggerGeneration(generationData.generationId);

    // Step 6: Poll for completion
    log(`\n6️⃣  Waiting for generation to complete...`, 'cyan');
    const finalGeneration = await pollGenerationStatus(generationData.generationId);

    // Step 7: Test download (if completed)
    if (finalGeneration.status === 'completed' && finalGeneration.downloadToken) {
      log(`\n7️⃣  Testing download...`, 'cyan');
      testResult.downloadToken = finalGeneration.downloadToken;
      await testDownload(finalGeneration.downloadToken, tierConfig.tier);
    } else if (finalGeneration.status === 'review_required') {
      log(`\n⚠️  Generation requires manual review - skipping download test`, 'yellow');
    }

    testResult.passed = true;
    log(`\n✅ ${tierConfig.name} tier test PASSED!`, 'green');
    testResults.passed++;
  } catch (error) {
    testResult.error = error.message;
    log(`\n❌ ${tierConfig.name} tier test FAILED: ${error.message}`, 'red');
    testResults.failed++;
  }

  testResults.tests.push(testResult);
  return testResult;
}

async function printSummary() {
  header('Test Summary');

  console.log('');
  testResults.tests.forEach((test) => {
    const icon = test.passed ? '✅' : '❌';
    const color = test.passed ? 'green' : 'red';
    log(`${icon} ${test.tier} Tier: ${test.passed ? 'PASSED' : 'FAILED'}`, color);

    if (test.generationId) {
      log(`   Generation ID: ${test.generationId}`, 'blue');
    }
    if (test.txSignature) {
      log(`   Transaction: ${test.txSignature}`, 'blue');
    }
    if (test.error) {
      log(`   Error: ${test.error}`, 'red');
    }
    console.log('');
  });

  console.log('='.repeat(70));
  log(`Total: ${testResults.tests.length} tests`, 'cyan');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  console.log('='.repeat(70));

  if (testResults.failed === 0) {
    log(`\n🎉 ALL TESTS PASSED! Your dApp is ready to launch! 🚀`, 'green');
    return 0;
  } else {
    log(`\n⚠️  Some tests failed. Please review the errors above.`, 'yellow');
    return 1;
  }
}

async function main() {
  console.clear();
  log('\n🧪 End-to-End Payment & Generation Test Suite\n', 'magenta');
  log(`Test Wallet: ${testWallet.publicKey.toBase58()}`, 'blue');
  log(`Treasury Wallet: ${TREASURY_WALLET.toBase58()}`, 'blue');
  log(`API Base: ${API_BASE}\n`, 'blue');

  // Check if dev server is running
  try {
    await axios.get(`${API_BASE}/api/health`, { timeout: 5000 });
    log('✓ Dev server is running\n', 'green');
  } catch (error) {
    log('✗ Dev server is not running!', 'red');
    log('Please start it with: npm run dev', 'yellow');
    process.exit(1);
  }

  const connection = new Connection(SOLANA_RPC, 'confirmed');

  // Test each tier
  for (const tier of TIERS) {
    await testTier(connection, tier);

    // Wait between tests
    if (tier !== TIERS[TIERS.length - 1]) {
      log('\n⏸️  Waiting 5 seconds before next test...', 'yellow');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  const exitCode = await printSummary();
  process.exit(exitCode);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Run tests
main();
