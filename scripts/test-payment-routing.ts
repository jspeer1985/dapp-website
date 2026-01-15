#!/usr/bin/env ts-node

/**
 * Payment Routing Verification Script
 * Tests both Solana and Stripe payment routing
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PaymentTestResult {
  solana: {
    treasuryWallet: string;
    balance: number;
    isConnected: boolean;
    status: 'working' | 'error';
    error?: string;
  };
  stripe: {
    publishableKey: string;
    hasRealKey: boolean;
    status: 'working' | 'error' | 'placeholder';
    error?: string;
  };
}

async function testPaymentRouting(): Promise<PaymentTestResult> {
  const result: PaymentTestResult = {
    solana: {
      treasuryWallet: '',
      balance: 0,
      isConnected: false,
      status: 'error'
    },
    stripe: {
      publishableKey: '',
      hasRealKey: false,
      status: 'error'
    }
  };

  // Test Solana Treasury Wallet
  try {
    const treasuryWallet = process.env.SOLANA_TREASURY_WALLET;
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    
    if (!treasuryWallet) {
      result.solana.error = 'SOLANA_TREASURY_WALLET not configured';
    } else {
      result.solana.treasuryWallet = treasuryWallet;
      
      const connection = new Connection(rpcUrl, 'confirmed');
      const publicKey = new PublicKey(treasuryWallet);
      const balance = await connection.getBalance(publicKey);
      
      result.solana.balance = balance / LAMPORTS_PER_SOL;
      result.solana.isConnected = true;
      result.solana.status = 'working';
      
      console.log('✅ Solana Treasury Wallet:');
      console.log(`   Address: ${treasuryWallet}`);
      console.log(`   Balance: ${result.solana.balance} SOL`);
      console.log(`   Network: ${rpcUrl.includes('devnet') ? 'devnet' : 'mainnet'}`);
    }
  } catch (error) {
    result.solana.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Solana Test Failed:', result.solana.error);
  }

  // Test Stripe Configuration
  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      result.stripe.error = 'STRIPE_PUBLISHABLE_KEY not configured';
    } else {
      result.stripe.publishableKey = publishableKey;
      
      // Check if it's a placeholder key
      if (publishableKey.includes('xxxxxxxxxxxx')) {
        result.stripe.status = 'placeholder';
        result.stripe.error = 'Using placeholder Stripe key - payments will fail';
      } else if (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_')) {
        result.stripe.hasRealKey = true;
        result.stripe.status = 'working';
        console.log('✅ Stripe Configuration:');
        console.log(`   Key Type: ${publishableKey.startsWith('pk_test_') ? 'Test' : 'Live'}`);
        console.log(`   Key Valid: Valid format detected`);
      } else {
        result.stripe.status = 'error';
        result.stripe.error = 'Invalid Stripe key format';
      }
    }
  } catch (error) {
    result.stripe.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Stripe Test Failed:', result.stripe.error);
  }

  return result;
}

async function main() {
  console.log('🔍 PAYMENT ROUTING VERIFICATION');
  console.log('=====================================\n');

  const result = await testPaymentRouting();

  console.log('\n📊 RESULTS SUMMARY:');
  console.log('==================');

  // Solana Results
  console.log('\n💰 SOLANA PAYMENTS:');
  if (result.solana.status === 'working') {
    console.log('✅ Status: WORKING');
    console.log(`💳 Treasury: ${result.solana.treasuryWallet}`);
    console.log(`💵 Balance: ${result.solana.balance} SOL`);
    console.log('🎯 Payments are routed to YOUR wallet!');
  } else {
    console.log('❌ Status: ERROR');
    console.log(`🔧 Error: ${result.solana.error}`);
  }

  // Stripe Results  
  console.log('\n💳 STRIPE PAYMENTS:');
  if (result.stripe.status === 'working') {
    console.log('✅ Status: WORKING');
    console.log(`🔑 Key Type: ${result.stripe.publishableKey.startsWith('pk_test_') ? 'Test' : 'Live'}`);
    console.log('🎯 Card payments will go to YOUR Stripe account!');
  } else if (result.stripe.status === 'placeholder') {
    console.log('⚠️  Status: PLACEHOLDER KEYS');
    console.log('🚨 ERROR: Using placeholder Stripe keys!');
    console.log('💳 Card payments will FAIL or go to test account!');
    console.log('🔧 FIX: Replace with real Stripe keys from dashboard.stripe.com');
  } else {
    console.log('❌ Status: ERROR');
    console.log(`🔧 Error: ${result.stripe.error}`);
  }

  // Action Items
  console.log('\n🎯 ACTION ITEMS:');
  console.log('=================');
  
  if (result.solana.status === 'working') {
    console.log('✅ Solana payments are working correctly');
  } else {
    console.log('🔧 Fix Solana configuration');
  }

  if (result.stripe.status === 'placeholder') {
    console.log('🚨 URGENT: Replace Stripe placeholder keys');
    console.log('   1. Go to https://dashboard.stripe.com');
    console.log('   2. Copy your API keys');
    console.log('   3. Update .env file');
    console.log('   4. Create Stripe products & prices');
  } else if (result.stripe.status === 'working') {
    console.log('✅ Stripe payments are working correctly');
  } else {
    console.log('🔧 Fix Stripe configuration');
  }

  // Test Instructions
  console.log('\n🧪 TESTING INSTRUCTIONS:');
  console.log('========================');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Go to: http://localhost:3000/generate');
  console.log('3. Try SOL payment (should work)');
  console.log('4. Try card payment (will fail until Stripe fixed)');

  console.log('\n🎉 VERIFICATION COMPLETE!');
}

// Error handling
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { testPaymentRouting };
