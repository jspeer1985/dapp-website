#!/bin/bash

# Setup script for OPTIK dApp Factory Environment
echo "🚀 Setting up OPTIK dApp Factory Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file with development defaults..."
    cat > .env << 'EOF'
# Solana Development Environment Configuration
# This file is used for development purposes

# Network Configuration - Using Devnet for stability
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_WS_URL=wss://api.devnet.solana.com

# Application Settings
NEXT_PUBLIC_APP_NAME=OPTIK dApp Factory
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_SUPPORT_EMAIL=support@optikecosystem.com

# Security
NEXT_PUBLIC_ENCRYPTION_KEY=dev_encryption_key_32_chars_long
EOF
    echo "✅ .env file created successfully!"
else
    echo "ℹ️ .env file already exists"
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎉 Setup complete! Run 'npm run dev' to start the development server."
