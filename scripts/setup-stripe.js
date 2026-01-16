
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prices = {
    TOKEN: { STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 1899 },
    DAPP: { STARTER: 1499, PROFESSIONAL: 2899, ENTERPRISE: 4999 },
    BUNDLE: { STARTER: 1799, PROFESSIONAL: 3499, ENTERPRISE: 6299 }
};

console.log('🚀 Creating Stripe Products & Prices (Attempt 3)...');

let envContent = '\n# --- Stripe Price IDs (Auto-Generated) ---\n';

for (const type of ['TOKEN', 'DAPP', 'BUNDLE']) {
    for (const tier of ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']) {
        const name = `Optik ${type.charAt(0) + type.slice(1).toLowerCase()} - ${tier.charAt(0) + tier.slice(1).toLowerCase()}`;
        const amount = prices[type][tier] * 100;

        console.log(`Creating: ${name} ($${prices[type][tier]})`);

        try {
            // Removed --json flag, assuming output is JSON by default
            const cmd = `stripe products create -d "name=${name}" -d "default_price_data[currency]=usd" -d "default_price_data[unit_amount]=${amount}"`;
            const output = execSync(cmd).toString();
            const result = JSON.parse(output);
            const priceId = result.default_price;

            const envVar = `NEXT_PUBLIC_STRIPE_${type}_${tier}_PRICE_ID`;
            console.log(`✅ ${envVar}=${priceId}`);
            envContent += `${envVar}=${priceId}\n`;

        } catch (e) {
            console.error(`❌ Failed to create ${name}:`, e.message);
        }
    }
}

fs.appendFileSync(path.join(process.cwd(), '.env'), envContent);
console.log('\n✨ All Price IDs added to .env!');
