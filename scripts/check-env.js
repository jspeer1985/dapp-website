
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('--- Checking Stripe Env Vars ---');
const vars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_BUNDLE_ENTERPRISE_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_BUNDLE_PROFESSIONAL_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_BUNDLE_STARTER_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_TOKEN_ENTERPRISE_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_DAPP_ENTERPRISE_PRICE_ID'
];

vars.forEach(key => {
    const val = process.env[key];
    if (!val) {
        console.log(`❌ ${key}: MISSING`);
    } else {
        console.log(`✅ ${key}: Found (${val.substring(0, 8)}...)`);
    }
});
