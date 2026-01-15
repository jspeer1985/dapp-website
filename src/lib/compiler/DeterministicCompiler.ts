import JSZip from 'jszip';
import { ProjectConfig, CompilationResult } from './types';
import { ConfigValidator } from './ConfigValidator';
import { FeatureTemplateRegistry } from './FeatureTemplateRegistry';
import { CodeTemplates } from './CodeTemplates';
import { SolanaProgramGenerator } from './SolanaProgramGenerator';

export class DeterministicDAppCompiler {
  private config: ProjectConfig;
  private files: Record<string, string> = {};
  private solanaGenerator: SolanaProgramGenerator;

  constructor(config: ProjectConfig) {
    this.config = config;
    this.solanaGenerator = new SolanaProgramGenerator(config);
  }

  async compile(): Promise<CompilationResult> {
    try {
      // PHASE 1: VALIDATE
      const validation = ConfigValidator.validate(this.config);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      // PHASE 2: GENERATE ALL FILES
      this.generateProjectStructure();
      this.generateTokenContract();
      this.generateFeatureFiles();
      this.generateConfigFiles();
      this.generateDocumentation();

      // PHASE 3: CREATE ZIP
      const zipBlob = await this.createZipArchive();

      return { 
        success: true, 
        zipBlob,
        fileCount: Object.keys(this.files).length 
      };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  private generateProjectStructure() {
    this.files['package.json'] = CodeTemplates.getPackageJson(this.config);
    this.files['tsconfig.json'] = this.getTsConfig();
    this.files['.gitignore'] = this.getGitIgnore();
    this.files['README.md'] = this.getReadme();
    this.files['tailwind.config.js'] = this.getTailwindConfig();
    this.files['postcss.config.js'] = this.getPostcssConfig();
    this.files['next.config.js'] = 'module.exports = { reactStrictMode: true }';
  }

  private generateTokenContract() {
    if (!this.config.token.enabled) return;

    // Generate actual Solana programs
    this.files['programs/token/src/lib.rs'] = this.solanaGenerator.generateTokenProgram();
    this.files['programs/token/Cargo.toml'] = this.solanaGenerator.generateCargoToml();
    this.files['Anchor.toml'] = this.solanaGenerator.generateAnchorToml();
    
    // Generate deployment script
    this.files['scripts/deploy-token.ts'] = this.solanaGenerator.generateDeployScript();
    
    // Generate package.json for Solana project
    this.files['package.json'] = this.getSolanaPackageJson();
    
    // Generate constants with actual program ID
    this.files['lib/constants.ts'] = this.getConstants();
    
    // If staking is requested, generate staking program
    if (this.config.dapp.features.includes('staking')) {
      this.files['programs/staking/src/lib.rs'] = this.solanaGenerator.generateStakingProgram();
      this.files['programs/staking/Cargo.toml'] = this.solanaGenerator.generateCargoToml();
    }
  }

  private generateFeatureFiles() {
    // Always generate core files
    this.files['app/layout.tsx'] = CodeTemplates.getRootLayout(this.config);
    this.files['app/page.tsx'] = CodeTemplates.getHomePage(this.config);
    this.files['app/globals.css'] = this.getGlobalStyles();
    this.files['components/WalletProvider.tsx'] = CodeTemplates.getWalletProvider();
    this.files['components/Navigation.tsx'] = CodeTemplates.getNavigation(this.config);

    // Generate feature-driven files
    const requiredFiles = FeatureTemplateRegistry.getRequiredFiles(this.config.dapp.features);

    // Generate pages
    this.config.dapp.features.forEach(feature => {
      const template = FeatureTemplateRegistry.getTemplate(feature);
      template.pages.forEach(pageName => {
        this.files[`app/${pageName}/page.tsx`] = this.getPageForFeature(feature);
      });
    });

    // Generate API routes
    requiredFiles.apiRoutes.forEach(route => {
      this.files[`app/api/${route}/route.ts`] = this.getGenericAPI(route);
    });

    // Generate components
    requiredFiles.components.forEach(component => {
      this.files[`components/${component}.tsx`] = this.getGenericComponent(component);
    });
  }

  private generateConfigFiles() {
    this.files['.env.example'] = this.getEnvExample();
    
    if (this.config.infra.db === 'postgres') {
      this.files['prisma/schema.prisma'] = this.getPrismaSchema();
      this.files['db/seed.ts'] = this.getSeedFile();
    }
  }

  private generateDocumentation() {
    this.files['DEPLOYMENT.md'] = this.getDeploymentGuide();
    this.files['ARCHITECTURE.md'] = this.getArchitectureDoc();
  }

  private getPageForFeature(feature: string): string {
    // Return actual feature page code based on feature type
    switch (feature) {
      case 'staking':
        return CodeTemplates.getStakingPage(this.config);
      // Add other features
      default:
        return this.getGenericPage(feature);
    }
  }

  private getGenericPage(name: string): string {
    return `export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold">${name}</h1>
    </div>
  );
}`;
  }

  private getGenericAPI(name: string): string {
    return `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: '${name} endpoint' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, data: body });
}`;
  }

  private getGenericComponent(name: string): string {
    return `export function ${name}() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">${name}</h2>
      <p className="text-gray-400">Component content here</p>
    </div>
  );
}`;
  }

  private async createZipArchive(): Promise<Blob> {
    const zip = new JSZip();
    Object.entries(this.files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    return await zip.generateAsync({ 
      type: 'blob', 
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }

  // Helper methods for config files
  private getTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        paths: { '@/*': ['./*'] }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    }, null, 2);
  }

  private getGitIgnore(): string {
    return `node_modules\n.next\n.env\n.env.local\ndist\nbuild\n.DS_Store\n*.log\ndeployment.json\n.keys`;
  }

  private getTailwindConfig(): string {
    return `module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { 
    extend: { 
      colors: { 
        brand: '${this.config.dapp.brandColor}' 
      } 
    } 
  },
  plugins: []
}`;
  }

  private getPostcssConfig(): string {
    return `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`;
  }

  private getGlobalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-color: ${this.config.dapp.brandColor};
}

body {
  @apply bg-gray-900 text-white;
}`;
  }

  private getSolanaPackageJson(): string {
    return JSON.stringify({
      name: this.config.project.name.toLowerCase().replace(/\s+/g, '-'),
      version: "0.1.0",
      description: `Solana dApp with ${this.config.token.symbol} token`,
      main: "index.js",
      scripts: {
        "anchor": "anchor",
        "anchor-build": "anchor build",
        "anchor-deploy": "anchor deploy",
        "anchor-test": "anchor test",
        "deploy": "ts-node scripts/deploy-token.ts",
        "start": "next dev",
        "build": "next build",
        "lint": "next lint"
      },
      dependencies: {
        "@coral-xyz/anchor": "^0.29.0",
        "@solana/web3.js": "^1.87.6",
        "@solana/wallet-adapter-base": "^0.9.23",
        "@solana/wallet-adapter-react": "^0.15.35",
        "@solana/wallet-adapter-react-ui": "^0.9.35",
        "next": "^14.2.0",
        "react": "^18.3.0",
        "react-dom": "^18.3.0",
        "bs58": "^5.0.0",
        "bn.js": "^5.2.1"
      },
      devDependencies: {
        "@types/bn.js": "^5.1.5",
        "@types/node": "^22.10.2",
        "@types/react": "^18.3.17",
        "@types/react-dom": "^18.3.5",
        "typescript": "^5.7.2",
        "ts-node": "^10.9.2",
        "chai": "^4.3.10",
        "mocha": "^10.2.0"
      },
      keywords: [
        "solana",
        "blockchain",
        "token",
        "dapp",
        this.config.token.symbol.toLowerCase()
      ],
      author: "Generated by OPTIK",
      license: "MIT"
    }, null, 2);
  }

  private getConstants(): string {
    const programId = this.solanaGenerator['generateProgramId']();
    return `export const TOKEN_CONFIG = {
  name: '${this.config.token.name}',
  symbol: '${this.config.token.symbol}',
  decimals: ${this.config.token.decimals},
  supply: ${this.config.token.supply},
  programId: '${programId}',
} as const;

export const APP_CONFIG = {
  name: '${this.config.project.name}',
  brandColor: '${this.config.dapp.brandColor}',
  solanaNetwork: 'devnet', // Change to mainnet for production
} as const;

export const SOLANA_CONFIG = {
  rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  network: process.env.SOLANA_NETWORK || 'devnet',
  tokenProgramId: programId,
} as const;`;
  }

  private getEnvExample(): string {
    return `SOLANA_RPC_URL=https://api.devnet.solana.com
DATABASE_URL="postgresql://user:password@localhost:5432/${this.config.project.name.toLowerCase()}"
NEXT_PUBLIC_TOKEN_SYMBOL="${this.config.token.symbol}"`;
  }

  private getPrismaSchema(): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  wallet    String   @unique
  createdAt DateTime @default(now())
}`;
  }

  private getSeedFile(): string {
    return `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
}

main().catch(console.error).finally(() => prisma.$disconnect());`;
  }

  private getReadme(): string {
    return `# ${this.config.project.name}

## Solana dApp with ${this.config.token.symbol} Token

### 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
cargo install anchor-cli

# Build programs
npm run anchor-build

# Deploy to devnet
npm run deploy

# Start frontend
npm run start
\`\`\`

### 📋 Project Structure

- \`programs/token/\` - SPL token smart contract
- \`programs/staking/\` - Staking program (if enabled)
- \`scripts/\` - Deployment scripts
- \`app/\` - Next.js frontend
- \`components/\` - React components
- \`lib/\` - Utility functions and constants

### 🔗 Generated Resources

- **Token Program ID**: See \`lib/constants.ts\`
- **Token Address**: Generated during deployment
- **Deployment Info**: \`deployment.json\` (after deployment)

### 🛠️ Commands

- \`npm run anchor-build\` - Build Solana programs
- \`npm run anchor-deploy\` - Deploy to Solana
- \`npm run anchor-test\` - Run tests
- \`npm run deploy\` - Deploy token and mint initial supply
- \`npm run dev\` - Start development server

### 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture](./ARCHITECTURE.md)

---

**Generated by OPTIK - The Rails of Web3**`;
  }

  private getDeploymentGuide(): string {
    return `# Deployment Guide\n\nDeploy your ${this.config.project.name}`;
  }

  private getArchitectureDoc(): string {
    return `# Architecture\n\nBuilt with Next.js 14, Solana, ${this.config.infra.db}`;
  }
}
