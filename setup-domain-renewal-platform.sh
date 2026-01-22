#!/bin/bash
# Domain Renewal Platform - Quick Start Script
# Run this to set up your development environment

echo "🚀 Domain Renewal Platform - Quick Start"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Install from nodejs.org"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Install from postgresql.org"; exit 1; }

echo "✅ Node.js installed: $(node -v)"
echo "✅ PostgreSQL installed: $(psql --version)"
echo ""

# Create project structure
echo "Creating project structure..."
mkdir -p domain-renewal-platform
cd domain-renewal-platform

mkdir -p backend/src/{config,models,routes,services,jobs,middleware,utils}
mkdir -p backend/migrations
mkdir -p frontend/src/{components,pages,services}

echo "✅ Project structure created"
echo ""

# Backend package.json
echo "Setting up backend..."
cat > backend/package.json << 'EOF'
{
  "name": "domain-renewal-backend",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "migrate": "psql $DATABASE_URL -f migrations/001_initial_schema.sql"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "stripe": "^14.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "node-cron": "^3.0.3",
    "aws-sdk": "^2.1500.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "domain-renewal-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
EOF

echo "✅ Package files created"
echo ""

# Create .env.example
echo "Creating environment template..."
cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/domain_platform

# OpenSRS (Apply at opensrs.com)
OPENSRS_API_KEY=your_opensrs_api_key
OPENSRS_USERNAME=your_opensrs_username
OPENSRS_ENVIRONMENT=sandbox

# Stripe (Get from stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS SES (For emails)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_access_key
AWS_SES_SECRET_KEY=your_secret_key
FROM_EMAIL=noreply@yourdomain.com

# App Settings
JWT_SECRET=your_super_secret_key_min_32_characters_long
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENABLE_CRON_JOBS=true
EOF

cat > frontend/.env.example << 'EOF'
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF

echo "✅ Environment templates created"
echo ""

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"
echo ""

# Create database
echo "Creating database..."
createdb domain_platform 2>/dev/null || echo "⚠️  Database may already exist"

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.example frontend/.env"
echo "   # Then edit both files with your API keys"
echo ""
echo "2. Get API Keys:"
echo "   - OpenSRS: Apply at https://opensrs.com"
echo "   - Stripe: Get test keys at https://dashboard.stripe.com/test/apikeys"
echo "   - AWS SES: Create IAM user at https://console.aws.amazon.com/iam/"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run migrate"
echo ""
echo "4. Start development servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "5. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "=========================================="
echo ""
echo "💡 Tips:"
echo "- Start with OpenSRS sandbox mode (free)"
echo "- Use Stripe test mode (no real charges)"
echo "- AWS SES requires email verification in sandbox"
echo ""
echo "📖 Read the README.md for full documentation"
echo ""
