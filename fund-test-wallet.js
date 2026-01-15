#!/usr/bin/env node
/**
 * Fund test wallet from treasury for testing
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
const fs = require('fs');

async function main() {
  // Load test wallet address
  if (!fs.existsSync('.test-wallet.json')) {
    console.error('Test wallet not found. Run test-payment-flow.js first.');
    process.exit(1);
  }

  const testWalletData = JSON.parse(fs.readFileSync('.test-wallet.json'));
  const testWallet = Keypair.fromSecretKey(Uint8Array.from(testWalletData));

  console.log('Test Wallet:', testWallet.publicKey.toBase58());

  // Load treasury keypair
  const treasuryPrivateKey = JSON.parse(process.env.SOLANA_TREASURY_PRIVATE_KEY);
  const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(treasuryPrivateKey));

  console.log('Treasury Wallet:', treasuryKeypair.publicKey.toBase58());

  // Connect to Solana
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

  // Check balances
  const treasuryBalance = await connection.getBalance(treasuryKeypair.publicKey);
  const testBalance = await connection.getBalance(testWallet.publicKey);

  console.log('\nCurrent Balances:');
  console.log('  Treasury:', (treasuryBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
  console.log('  Test Wallet:', (testBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');

  // Calculate how much SOL we need (all 3 tiers + buffer for fees)
  const starterPrice = parseFloat(process.env.NEXT_PUBLIC_STARTER_PRICE_SOL);
  const proPrice = parseFloat(process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL);
  const enterprisePrice = parseFloat(process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_SOL);
  const totalNeeded = starterPrice + proPrice + enterprisePrice + 0.1; // 0.1 SOL buffer for fees

  console.log('\nTotal SOL needed for all tests:', totalNeeded.toFixed(2), 'SOL');

  if (testBalance / LAMPORTS_PER_SOL >= totalNeeded) {
    console.log('✓ Test wallet already has sufficient funds!');
    process.exit(0);
  }

  const amountToSend = totalNeeded - (testBalance / LAMPORTS_PER_SOL);
  console.log('Sending', amountToSend.toFixed(2), 'SOL to test wallet...\n');

  // Create and send transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: treasuryKeypair.publicKey,
      toPubkey: testWallet.publicKey,
      lamports: Math.floor(amountToSend * LAMPORTS_PER_SOL),
    })
  );

  console.log('Sending transaction...');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [treasuryKeypair],
    { commitment: 'confirmed' }
  );

  console.log('✓ Transfer successful!');
  console.log('Transaction:', signature);
  console.log('View:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Check new balance
  const newBalance = await connection.getBalance(testWallet.publicKey);
  console.log('\nNew test wallet balance:', (newBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
  console.log('✓ Test wallet is now funded for all tests!');
}

main().catch(console.error);
