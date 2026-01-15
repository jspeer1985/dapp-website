# Comprehensive Testing Strategy
## Solana dApp Factory Platform

**Version:** 1.0
**Date:** January 11, 2026
**Status:** Implementation Required

---

## Executive Summary

This document outlines a comprehensive testing strategy for the Solana dApp Factory platform, covering unit tests, integration tests, E2E tests, security tests, and load tests. Current test coverage is estimated at 60% - this strategy aims to achieve 90%+ coverage before production deployment.

---

## 1. Testing Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  10% - Full user journeys
        │   (20 tests)    │
        ├─────────────────┤
        │ Integration     │  30% - API + Service layer
        │ Tests           │
        │ (60 tests)      │
        ├─────────────────┤
        │                 │
        │  Unit Tests     │  60% - Functions + Utils
        │  (120 tests)    │
        │                 │
        └─────────────────┘
```

**Target Coverage:** 90% code coverage, 100% critical path coverage

---

## 2. Test Environment Setup

### 2.1 Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^9.1.1",
    "@solana/web3.js": "^1.95.0",
    "msw": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

### 2.2 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 2.3 Test Environment Variables

```bash
# tests/.env.test
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/dapp-factory-test
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TREASURY_WALLET=TEST_WALLET_ADDRESS
SOLANA_TREASURY_PRIVATE_KEY=TEST_PRIVATE_KEY
OPENAI_API_KEY=sk-test-mock-key
AI_PROVIDER=openai
```

---

## 3. Unit Tests

### 3.1 SolanaService Tests

**File:** `tests/unit/utils/SolanaService.test.ts`

```typescript
import { SolanaService } from '@/utils/SolanaService';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

describe('SolanaService', () => {
  let service: SolanaService;

  beforeEach(() => {
    service = new SolanaService();
  });

  describe('verifyPayment', () => {
    it('should verify valid payment transaction', async () => {
      const mockTransaction = createMockTransaction({
        sender: 'VALID_SENDER',
        recipient: 'TREASURY',
        amount: 1.1,
        status: 'success',
      });

      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await service.verifyPayment(
        'MOCK_SIGNATURE',
        1.1,
        'VALID_SENDER'
      );

      expect(result.isValid).toBe(true);
      expect(result.actualAmount).toBeCloseTo(1.1, 6);
      expect(result.confirmations).toBeGreaterThan(0);
    });

    it('should reject payment with insufficient amount', async () => {
      const mockTransaction = createMockTransaction({
        sender: 'VALID_SENDER',
        recipient: 'TREASURY',
        amount: 1.0, // Expected 1.1
        status: 'success',
      });

      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await service.verifyPayment(
        'MOCK_SIGNATURE',
        1.1,
        'VALID_SENDER'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('amount mismatch');
    });

    it('should reject payment from wrong sender', async () => {
      const mockTransaction = createMockTransaction({
        sender: 'WRONG_SENDER',
        recipient: 'TREASURY',
        amount: 1.1,
        status: 'success',
      });

      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await service.verifyPayment(
        'MOCK_SIGNATURE',
        1.1,
        'EXPECTED_SENDER'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Sender address mismatch');
    });

    it('should reject failed transaction', async () => {
      const mockTransaction = createMockTransaction({
        sender: 'VALID_SENDER',
        recipient: 'TREASURY',
        amount: 1.1,
        status: 'failed',
      });

      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await service.verifyPayment(
        'MOCK_SIGNATURE',
        1.1,
        'VALID_SENDER'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Transaction failed');
    });

    it('should allow overpayment within tolerance', async () => {
      const mockTransaction = createMockTransaction({
        sender: 'VALID_SENDER',
        recipient: 'TREASURY',
        amount: 1.15, // 4.5% over
        status: 'success',
      });

      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await service.verifyPayment(
        'MOCK_SIGNATURE',
        1.1,
        'VALID_SENDER'
      );

      expect(result.isValid).toBe(true);
    });

    it('should handle transaction not found', async () => {
      jest.spyOn(service['connection'], 'getTransaction')
        .mockResolvedValue(null);

      const result = await service.verifyPayment(
        'INVALID_SIGNATURE',
        1.1,
        'VALID_SENDER'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Transaction not found');
    });
  });

  describe('createToken', () => {
    it('should create token with valid parameters', async () => {
      // Mock createMint, getOrCreateAssociatedTokenAccount, mintTo
      const result = await service.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 9,
        totalSupply: 1000000,
        mintAuthority: new PublicKey('AUTHORITY'),
      });

      expect(result.mintAddress).toBeTruthy();
      expect(result.signature).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should fail without treasury keypair', async () => {
      const serviceWithoutKeypair = new SolanaService();
      serviceWithoutKeypair['treasuryKeypair'] = undefined;

      const result = await serviceWithoutKeypair.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 9,
        totalSupply: 1000000,
        mintAuthority: new PublicKey('AUTHORITY'),
      });

      expect(result.error).toContain('keypair not configured');
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const result = await service.processRefund({
        recipientAddress: 'RECIPIENT',
        amount: 1.1,
        reason: 'Test refund',
      });

      expect(result.success).toBe(true);
      expect(result.signature).toBeTruthy();
    });

    it('should validate recipient address', async () => {
      const result = await service.processRefund({
        recipientAddress: 'INVALID_ADDRESS',
        amount: 1.1,
        reason: 'Test refund',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});

// Helper function
function createMockTransaction(params: {
  sender: string;
  recipient: string;
  amount: number;
  status: 'success' | 'failed';
}) {
  // Return mock Solana transaction object
  return {
    slot: 1000,
    transaction: {
      message: {
        getAccountKeys: () => ({
          keySegments: () => [[
            new PublicKey(params.sender),
            new PublicKey(params.recipient),
          ]],
        }),
      },
    },
    meta: {
      err: params.status === 'failed' ? {} : null,
      preBalances: [10_000_000_000, 5_000_000_000],
      postBalances: [
        10_000_000_000 - (params.amount * 1_000_000_000),
        5_000_000_000 + (params.amount * 1_000_000_000),
      ],
    },
  };
}
```

### 3.2 AIService Tests

**File:** `tests/unit/utils/AIService.test.ts`

```typescript
import AIService from '@/utils/AIService';

describe('AIService', () => {
  describe('analyzeCodeSecurity', () => {
    it('should detect eval() usage', async () => {
      const files = [{
        path: 'test.ts',
        content: 'const result = eval("dangerous code");',
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].type).toBe('security');
      expect(result.flags[0].severity).toBe('high');
      expect(result.flags[0].message).toContain('eval()');
      expect(result.riskScore).toBeGreaterThanOrEqual(30);
    });

    it('should detect private key in localStorage', async () => {
      const files = [{
        path: 'wallet.ts',
        content: 'localStorage.setItem("privateKey", key);',
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].severity).toBe('high');
      expect(result.riskScore).toBeGreaterThanOrEqual(40);
    });

    it('should detect multiple security issues', async () => {
      const files = [{
        path: 'bad.ts',
        content: `
          const x = eval("code");
          localStorage.setItem("privateKey", key);
          element.innerHTML = userInput;
        `,
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.flags.length).toBeGreaterThanOrEqual(3);
      expect(result.riskScore).toBeGreaterThan(50);
    });

    it('should return low risk for safe code', async () => {
      const files = [{
        path: 'safe.ts',
        content: `
          import React from 'react';
          export function SafeComponent() {
            return <div>Hello World</div>;
          }
        `,
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.flags).toHaveLength(0);
      expect(result.riskScore).toBe(0);
    });

    it('should calculate risk score correctly', async () => {
      const files = [{
        path: 'test.ts',
        content: 'eval("x"); eval("y");', // 2 x 30 = 60 risk
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.riskScore).toBe(60);
    });

    it('should cap risk score at 100', async () => {
      const files = [{
        path: 'test.ts',
        content: `
          eval("1"); eval("2"); eval("3"); eval("4");
          localStorage.setItem("privateKey", "key");
          localStorage.setItem("secretKey", "key");
        `,
        language: 'typescript',
      }];

      const result = await AIService.analyzeCodeSecurity(files);

      expect(result.riskScore).toBe(100);
    });
  });

  describe('generateDApp', () => {
    it('should generate valid dApp structure', async () => {
      // Mock OpenAI API response
      const mockResponse = {
        files: [
          { path: 'src/app/page.tsx', content: 'export default function Home() {}', language: 'typescript' },
        ],
        packageJson: { name: 'test-dapp', version: '1.0.0' },
        readme: '# Test dApp',
      };

      // Test with mocked AI provider
      const result = await AIService.generateDApp({
        projectName: 'Test dApp',
        projectDescription: 'A test dApp',
        projectType: 'dapp',
        features: ['wallet', 'nft'],
      });

      expect(result.files).toBeInstanceOf(Array);
      expect(result.packageJson).toBeTruthy();
      expect(result.readme).toBeTruthy();
      expect(result.totalFiles).toBeGreaterThan(0);
    });
  });
});
```

### 3.3 FilePackagingService Tests

**File:** `tests/unit/utils/FilePackagingService.test.ts`

```typescript
import FilePackagingService from '@/utils/FilePackagingService';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

describe('FilePackagingService', () => {
  const testOutputDir = path.join(__dirname, 'test-output');

  beforeAll(async () => {
    await fs.promises.mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
  });

  describe('packageProject', () => {
    it('should create valid zip file', async () => {
      const result = await FilePackagingService.packageProject({
        generationId: 'test-123',
        projectName: 'Test Project',
        files: [
          { path: 'src/index.ts', content: 'console.log("hello");', language: 'typescript' },
        ],
        packageJson: { name: 'test-project' },
        readme: '# Test Project',
      });

      expect(result.zipPath).toBeTruthy();
      expect(result.downloadToken).toHaveLength(32);
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Verify zip contents
      const zip = new AdmZip(result.zipPath);
      const entries = zip.getEntries();

      expect(entries.length).toBeGreaterThan(0);
      expect(entries.find(e => e.entryName === 'package.json')).toBeTruthy();
      expect(entries.find(e => e.entryName === 'README.md')).toBeTruthy();
      expect(entries.find(e => e.entryName === '.gitignore')).toBeTruthy();
    });

    it('should include all config files', async () => {
      const result = await FilePackagingService.packageProject({
        generationId: 'test-456',
        projectName: 'Config Test',
        files: [],
        packageJson: {},
        readme: '',
      });

      const zip = new AdmZip(result.zipPath);
      const entries = zip.getEntries().map(e => e.entryName);

      expect(entries).toContain('.gitignore');
      expect(entries).toContain('.env.example');
      expect(entries).toContain('.eslintrc.json');
      expect(entries).toContain('tsconfig.json');
    });

    it('should set correct expiration time', async () => {
      const beforeTime = new Date();
      const result = await FilePackagingService.packageProject({
        generationId: 'test-789',
        projectName: 'Expiration Test',
        files: [],
        packageJson: {},
        readme: '',
      });
      const afterTime = new Date();

      const expectedExpiration = 24 * 60 * 60 * 1000; // 24 hours
      const actualDuration = result.expiresAt.getTime() - beforeTime.getTime();

      expect(actualDuration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(actualDuration).toBeLessThanOrEqual(expectedExpiration + 1000);
    });
  });

  describe('cleanupExpiredFiles', () => {
    it('should remove files older than retention period', async () => {
      // Create test file with old timestamp
      const oldFilePath = path.join(testOutputDir, 'old-file.zip');
      await fs.promises.writeFile(oldFilePath, 'test');

      // Modify timestamp to be old
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      await fs.promises.utimes(oldFilePath, oldDate, oldDate);

      await FilePackagingService.cleanupExpiredFiles();

      const exists = fs.existsSync(oldFilePath);
      expect(exists).toBe(false);
    });

    it('should keep recent files', async () => {
      const recentFilePath = path.join(testOutputDir, 'recent-file.zip');
      await fs.promises.writeFile(recentFilePath, 'test');

      await FilePackagingService.cleanupExpiredFiles();

      const exists = fs.existsSync(recentFilePath);
      expect(exists).toBe(true);

      // Cleanup
      await fs.promises.unlink(recentFilePath);
    });
  });
});
```

---

## 4. Integration Tests

### 4.1 Generation Flow Tests

**File:** `tests/integration/generation-flow.test.ts`

```typescript
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Generation Flow Integration', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectToDatabase();
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Generation.deleteMany({});
  });

  it('should complete full generation lifecycle', async () => {
    // 1. Create generation
    const generation = new Generation({
      generationId: 'test-flow-1',
      walletAddress: 'TEST_WALLET',
      projectName: 'Test Project',
      projectDescription: 'Test Description',
      projectType: 'dapp',
      tier: 'starter',
      aiConfig: {
        provider: 'openai',
        model: 'gpt-4',
        prompt: 'test',
        temperature: 0.7,
      },
      payment: {
        amount: 1.1,
        currency: 'SOL',
        transactionSignature: 'TEST_SIG',
        status: 'pending',
        timestamp: new Date(),
        confirmations: 0,
      },
      status: 'pending_payment',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      timestamps: { created: new Date() },
      errors: [],
      compliance: {
        riskScore: 0,
        flags: [],
        whitelistStatus: 'pending',
      },
      analytics: {},
    });

    await generation.save();
    expect(generation.status).toBe('pending_payment');

    // 2. Confirm payment
    generation.payment.status = 'confirmed';
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();
    await generation.save();

    expect(generation.status).toBe('payment_confirmed');

    // 3. Start generation
    generation.status = 'generating';
    generation.timestamps.generationStarted = new Date();
    await generation.save();

    expect(generation.status).toBe('generating');

    // 4. Complete generation (low risk)
    generation.generatedCode = {
      files: [{ path: 'test.ts', content: 'test', language: 'typescript' }],
      totalFiles: 1,
      totalLines: 1,
    };
    generation.compliance.riskScore = 10;
    generation.status = 'approved';
    generation.timestamps.approved = new Date();
    await generation.save();

    expect(generation.status).toBe('approved');

    // 5. Complete
    generation.status = 'completed';
    generation.timestamps.generationCompleted = new Date();
    generation.downloadInfo = {
      zipUrl: '/tmp/test.zip',
      downloadToken: 'TEST_TOKEN',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      downloadCount: 0,
      maxDownloads: 10,
    };
    await generation.save();

    expect(generation.status).toBe('completed');
    expect(generation.canDownload()).toBe(true);
  });

  it('should handle high-risk code requiring review', async () => {
    const generation = new Generation({
      generationId: 'test-flow-2',
      walletAddress: 'TEST_WALLET',
      projectName: 'High Risk Project',
      projectDescription: 'Test',
      projectType: 'dapp',
      tier: 'starter',
      aiConfig: {
        provider: 'openai',
        model: 'gpt-4',
        prompt: 'test',
        temperature: 0.7,
      },
      payment: {
        amount: 1.1,
        currency: 'SOL',
        transactionSignature: 'TEST_SIG_2',
        status: 'confirmed',
        timestamp: new Date(),
        confirmations: 15,
      },
      status: 'generating',
      ipAddress: '127.0.0.1',
      userAgent: 'test',
      timestamps: {
        created: new Date(),
        paymentConfirmed: new Date(),
        generationStarted: new Date(),
      },
      errors: [],
      compliance: {
        riskScore: 0,
        flags: [],
        whitelistStatus: 'pending',
      },
      analytics: {},
    });

    await generation.save();

    // Simulate high-risk code generation
    generation.generatedCode = {
      files: [
        { path: 'dangerous.ts', content: 'eval("code")', language: 'typescript' },
      ],
      totalFiles: 1,
      totalLines: 1,
    };
    generation.compliance.riskScore = 70;
    generation.compliance.flags = [{
      type: 'security',
      severity: 'high',
      message: 'Use of eval() detected',
      timestamp: new Date(),
    }];
    generation.status = 'review_required';
    await generation.save();

    expect(generation.status).toBe('review_required');
    expect(generation.canDownload()).toBe(false);

    // Admin approves
    generation.status = 'approved';
    generation.compliance.whitelistStatus = 'approved';
    generation.compliance.reviewedBy = 'admin';
    generation.compliance.reviewedAt = new Date();
    generation.timestamps.approved = new Date();
    await generation.save();

    expect(generation.status).toBe('approved');
  });
});
```

### 4.2 API Endpoint Tests

**File:** `tests/integration/api-endpoints.test.ts`

```typescript
import request from 'supertest';
import { NextApiHandler } from 'next';

// Mock Next.js app
const app = createTestApp();

describe('API Endpoints', () => {
  describe('POST /api/generations/create', () => {
    it('should create generation with valid input', async () => {
      const response = await request(app)
        .post('/api/generations/create')
        .send({
          walletAddress: 'CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB',
          projectName: 'Test dApp',
          projectDescription: 'Test description',
          projectType: 'dapp',
          tier: 'starter',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.generationId).toBeTruthy();
      expect(response.body.treasuryWallet).toBeTruthy();
      expect(response.body.paymentAmount).toBeGreaterThan(0);
    });

    it('should reject invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/generations/create')
        .send({
          walletAddress: 'INVALID_ADDRESS',
          projectName: 'Test',
          projectDescription: 'Test',
          projectType: 'dapp',
          tier: 'starter',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should verify valid payment', async () => {
      // Create generation first
      const createResponse = await request(app)
        .post('/api/generations/create')
        .send({
          walletAddress: 'CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB',
          projectName: 'Test',
          projectDescription: 'Test',
          projectType: 'dapp',
          tier: 'starter',
        });

      const generationId = createResponse.body.generationId;

      // Mock valid transaction
      const mockSignature = 'MOCK_VALID_SIGNATURE';

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          generationId,
          transactionSignature: mockSignature,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('payment_confirmed');
    });
  });

  describe('GET /api/optik/status/[jobId]', () => {
    it('should return status for existing generation', async () => {
      // Create test generation
      const generation = await createTestGeneration();

      const response = await request(app)
        .get(`/api/optik/status/${generation.generationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.jobId).toBe(generation.generationId);
      expect(response.body.status).toBeTruthy();
      expect(response.body.progress).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for non-existent generation', async () => {
      const response = await request(app)
        .get('/api/optik/status/NON_EXISTENT_ID')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## 5. End-to-End Tests

### 5.1 Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3003',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

### 5.2 Full User Journey Test

**File:** `tests/e2e/complete-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete dApp Generation Flow', () => {
  test('should generate and download dApp', async ({ page }) => {
    // 1. Navigate to factory
    await page.goto('/');

    // 2. Fill out generation form
    await page.fill('[name="projectName"]', 'E2E Test dApp');
    await page.fill('[name="projectDescription"]', 'Testing E2E flow');
    await page.selectOption('[name="tier"]', 'starter');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Wait for generation ID
    await expect(page.locator('[data-testid="generation-id"]')).toBeVisible();
    const generationId = await page.textContent('[data-testid="generation-id"]');

    // 5. Connect wallet (mock)
    await page.click('[data-testid="connect-wallet"]');
    // ... wallet connection flow

    // 6. Verify payment info displayed
    await expect(page.locator('[data-testid="payment-amount"]')).toBeVisible();

    // 7. Complete payment (mock transaction)
    await page.click('[data-testid="pay-now"]');
    // ... payment flow

    // 8. Wait for generation to complete (poll status)
    await page.waitForSelector('[data-testid="generation-complete"]', {
      timeout: 120000,
    });

    // 9. Download file
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;

    // 10. Verify download
    expect(download.suggestedFilename()).toContain('.zip');
  });
});
```

---

## 6. Security Testing

### 6.1 OWASP Top 10 Tests

**File:** `tests/security/owasp.test.ts`

```typescript
import request from 'supertest';

describe('OWASP Security Tests', () => {
  describe('SQL/NoSQL Injection', () => {
    it('should sanitize generation ID query', async () => {
      const maliciousId = '{ "$ne": null }';

      const response = await request(app)
        .get(`/api/generations/${maliciousId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize project name', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/generations/create')
        .send({
          projectName: xssPayload,
          // ... other fields
        });

      // Should either reject or sanitize
      if (response.status === 200) {
        expect(response.body.projectName).not.toContain('<script>');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(100).fill(null).map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 7. Load Testing

### 7.1 K6 Load Test Script

**File:** `tests/load/generation-load.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests under 2s
    http_req_failed: ['rate<0.05'],    // <5% failure rate
  },
};

const BASE_URL = 'http://localhost:3003';

export default function () {
  // 1. Create generation
  const createPayload = JSON.stringify({
    walletAddress: 'CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB',
    projectName: `Load Test ${__VU}-${__ITER}`,
    projectDescription: 'Load testing',
    projectType: 'dapp',
    tier: 'starter',
  });

  const createRes = http.post(`${BASE_URL}/api/generations/create`, createPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(createRes, {
    'create status 200': (r) => r.status === 200,
    'has generationId': (r) => r.json('generationId') !== undefined,
  });

  if (createRes.status !== 200) return;

  const generationId = createRes.json('generationId');

  // 2. Check status multiple times
  for (let i = 0; i < 5; i++) {
    const statusRes = http.get(`${BASE_URL}/api/generations/${generationId}`);
    check(statusRes, {
      'status check 200': (r) => r.status === 200,
    });
    sleep(1);
  }

  sleep(1);
}
```

---

## 8. Test Execution Plan

### 8.1 Pre-Commit Tests (Fast)
```bash
npm run test:unit
npm run test:lint
npm run type-check
```
**Time:** ~30 seconds
**Coverage:** Unit tests only

### 8.2 Pre-Push Tests (Medium)
```bash
npm run test:unit
npm run test:integration
npm run test:lint
npm run type-check
```
**Time:** ~5 minutes
**Coverage:** Unit + Integration

### 8.3 CI/CD Pipeline Tests (Full)
```bash
npm run test:all
npm run test:e2e
npm run test:security
npm run test:coverage
```
**Time:** ~15 minutes
**Coverage:** Everything except load tests

### 8.4 Weekly Tests (Comprehensive)
```bash
npm run test:all
npm run test:e2e
npm run test:security
npm run test:load
npm run test:coverage:report
```
**Time:** ~30 minutes
**Coverage:** Full suite including load tests

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: test-results/
```

---

## 10. Test Data Management

### 10.1 Test Fixtures

**File:** `tests/fixtures/generations.ts`

```typescript
export const testGenerations = {
  starter: {
    generationId: 'test-starter-1',
    walletAddress: 'CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB',
    projectName: 'Starter Test',
    projectDescription: 'Test starter project',
    projectType: 'dapp' as const,
    tier: 'starter' as const,
    payment: {
      amount: 1.1,
      currency: 'SOL' as const,
      transactionSignature: 'TEST_SIG_STARTER',
      status: 'pending' as const,
      timestamp: new Date('2026-01-11'),
      confirmations: 0,
    },
    status: 'pending_payment' as const,
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    timestamps: {
      created: new Date('2026-01-11'),
    },
    errors: [],
    compliance: {
      riskScore: 0,
      flags: [],
      whitelistStatus: 'pending' as const,
    },
    analytics: {},
  },
  // ... more fixtures
};
```

---

## 11. Summary & Next Steps

### Implementation Timeline

**Week 1:** Unit Tests
- [ ] SolanaService tests (30 tests)
- [ ] AIService tests (25 tests)
- [ ] FilePackagingService tests (15 tests)
- [ ] Model tests (20 tests)

**Week 2:** Integration Tests
- [ ] Generation flow tests (15 tests)
- [ ] API endpoint tests (25 tests)
- [ ] OPTIK integration tests (15 tests)

**Week 3:** E2E & Security
- [ ] Playwright E2E tests (10 tests)
- [ ] Security tests (15 tests)
- [ ] Load tests (5 scenarios)

**Week 4:** CI/CD & Coverage
- [ ] GitHub Actions setup
- [ ] Coverage reporting
- [ ] Documentation
- [ ] Team training

### Success Criteria

- ✅ 90%+ code coverage
- ✅ 100% critical path coverage
- ✅ All tests passing in CI/CD
- ✅ Load tests showing acceptable performance
- ✅ Security tests passing with no high-severity issues

---

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Next Review:** After implementation of Week 1 tests
