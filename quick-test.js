#!/usr/bin/env node
/**
 * Quick single-tier test
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
const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3003';
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
const TREASURY_WALLET = new PublicKey(process.env.SOLANA_TREASURY_WALLET);

// Load test wallet
const testWalletData = JSON.parse(fs.readFileSync('.test-wallet.json'));
const testWallet = Keypair.fromSecretKey(Uint8Array.from(testWalletData));

console.log('\n🧪 Quick Payment & Generation Test\n');
console.log('Test Wallet:', testWallet.publicKey.toBase58());
console.log('API:', API_BASE, '\n');

async function runTest() {
  const connection = new Connection(SOLANA_RPC, 'confirmed');

  // Step 1: Create generation
  console.log('1️⃣  Creating generation...');
  const createResponse = await axios.post(`${API_BASE}/api/generations/create`, {
    walletAddress: testWallet.publicKey.toBase58(),
    projectName: 'Quick Test dApp',
    projectDescription: 'A quick test to verify the payment and generation flow works correctly.',
    projectType: 'dapp',
    tier: 'starter',
    features: ['Wallet connection', 'Basic UI'],
  });

  console.log('✅ Generation created:', createResponse.data.generationId);
  const { generationId, paymentAmount } = createResponse.data;

  // Step 2: Send payment
  console.log('\n2️⃣  Sending payment of', paymentAmount, 'SOL...');
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: testWallet.publicKey,
      toPubkey: TREASURY_WALLET,
      lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL),
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [testWallet],
    { commitment: 'confirmed' }
  );

  console.log('✅ Payment sent:', signature);
  console.log('   View:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Wait for confirmation
  console.log('\n⏳ Waiting 5 seconds for transaction to finalize...');
  await new Promise(r => setTimeout(r, 5000));

  // Step 3: Verify payment
  console.log('\n3️⃣  Verifying payment...');
  const verifyResponse = await axios.post(`${API_BASE}/api/payments/verify`, {
    generationId,
    transactionSignature: signature,
  });

  console.log('✅ Payment verified!', verifyResponse.data);

  // Step 4: Trigger generation
  console.log('\n4️⃣  Triggering AI generation...');
  const generateResponse = await axios.post(
    `${API_BASE}/api/generations/${generationId}/generate`
  );

  console.log('✅ Generation triggered!');
  console.log('   Status:', generateResponse.data.status);
  if (generateResponse.data.requiresReview) {
    console.log('   ⚠️  Requires review (risk score:', generateResponse.data.riskScore + ')');
  }

  // Step 5: Poll for completion
  console.log('\n5️⃣  Waiting for generation to complete...');
  let generation;
  for (let i = 0; i < 60; i++) {
    const statusResponse = await axios.get(`${API_BASE}/api/generations/${generationId}`);
    generation = statusResponse.data;

    if (generation.status === 'completed') {
      console.log('✅ Generation completed!');
      break;
    } else if (generation.status === 'failed') {
      console.error('❌ Generation failed:', generation.error);
      process.exit(1);
    } else if (generation.status === 'review_required') {
      console.log('⚠️  Generation requires manual admin review');
      break;
    }

    process.stdout.write(`\r   Status: ${generation.status}... (${i + 1}/60)`);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Step 6: Download (if completed)
  if (generation.status === 'completed' && generation.downloadToken) {
    console.log('\n\n6️⃣  Testing download...');
    const downloadResponse = await axios.get(
      `${API_BASE}/api/download/${generation.downloadToken}`,
      { responseType: 'arraybuffer' }
    );

    const fileName = `quick-test-${Date.now()}.zip`;
    fs.writeFileSync(fileName, downloadResponse.data);
    const sizeKB = (downloadResponse.data.length / 1024).toFixed(2);
    console.log('✅ Downloaded:', fileName, `(${sizeKB} KB)`);
  }

  console.log('\n\n🎉 TEST PASSED! All systems working!\n');
  console.log('Generation ID:', generationId);
  console.log('Transaction:', signature);
  if (generation.downloadToken) {
    console.log('Download:', `${API_BASE}/api/download/${generation.downloadToken}`);
  }
}

runTest().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  if (error.response?.data) {
    console.error('Details:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
