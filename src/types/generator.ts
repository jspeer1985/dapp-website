// Type definitions for the proprietary generator service
// These define the interfaces but not the implementation

export interface ProjectConfig {
  projectId: string;
  template: string;
  tier: 'basic' | 'advanced' | 'enterprise';
  features: string[];
  chain: string;
  tokenConfig?: {
    name: string;
    symbol: string;
    supply: string;
  };
  vestingConfig?: {
    enabled: boolean;
    cliff: string;
    duration: string;
  };
  saleConfig?: {
    hardcap: string;
    price: string;
  };
}

export interface GeneratedArtifacts {
  projectId: string;
  contracts: CompiledContract[];
  frontend: FrontendArtifacts;
  infrastructure: InfrastructureConfig;
  security: SecurityReport;
  performance: PerformanceReport;
  metadata: ProjectMetadata;
  deploymentKey: string;
  generatedAt: string;
}

export interface CompiledContract {
  name: string;
  bytecode: string;
  abi: any[];
  source: string;
  optimizations: number;
  verified: boolean;
  gasEstimate: number;
}

export interface FrontendArtifacts {
  components: string[];
  build: string;
  themeConfig: string;
  dependencies: Record<string, string>;
}

export interface InfrastructureConfig {
  terraform: string;
  docker: string;
  kubernetes: string;
  environment: string;
}

export interface SecurityReport {
  score: number;
  issues: SecurityIssue[];
  gasOptimizationsApplied: number;
  vulnerabilities: Vulnerability[];
  mitigations: Mitigation[];
}

export interface PerformanceReport {
  deploymentTime: number;
  transactionSpeed: number;
  gasEfficiency: number;
  benchmarkComparison: BenchmarkComparison;
}

export interface ProjectMetadata {
  projectId: string;
  template: string;
  tier: string;
  optimizations: number;
  securityScore: number;
  gasOptimizations: number;
  generatedBy: string;
  licenseKey: string;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: number;
  description: string;
  pattern: string;
}

export interface Mitigation {
  id: string;
  vulnerabilityId: string;
  type: string;
  description: string;
  code: string;
}

export interface Optimization {
  id: string;
  type: string;
  description: string;
  gasSavings: number;
  code: string;
}

export interface Benchmark {
  projectId: string;
  template: string;
  gasUsed: number;
  deploymentTime: number;
  securityScore: number;
  timestamp: string;
}

export interface BenchmarkComparison {
  averageGas: number;
  yourGas: number;
  improvement: number;
  percentile: number;
}

// Internal types (never exposed to customers)
export interface EnhancedConfig extends ProjectConfig {
  optimizations: Optimization[];
  securityLevel: number;
  gasTarget: number;
  performanceTargets: PerformanceTargets;
}

export interface TemplateComposition {
  base: Template;
  features: Template[];
  merged: Template;
  optimizations: Optimization[];
}

export interface SecuredContracts {
  original: GeneratedContracts;
  mitigations: Mitigation[];
  hardened: GeneratedContracts;
  securityScore: number;
}

export interface OptimizedContracts {
  original: SecuredContracts;
  optimizations: Optimization[];
  optimized: GeneratedContracts;
  gasSavings: number;
  benchmarkComparison: BenchmarkComparison;
}

export interface PerformanceTargets {
  deploymentTime: number;
  transactionSpeed: number;
  concurrentUsers: number;
}

export interface CompositionParams {
  baseTemplate: string;
  features: string[];
  optimizations: Optimization[];
  securityLevel: number;
}

export interface Template {
  id: string;
  name: string;
  type: string;
  code: string;
  dependencies: string[];
  security: SecurityConfig;
}

export interface SecurityConfig {
  requiredPatterns: string[];
  forbiddenPatterns: string[];
  auditLevel: number;
}

export interface GeneratedContracts {
  type: string;
  contracts: CompiledContract[];
  totalGas: number;
}

// API Response types
export interface GenerationRequest {
  template: string;
  config: ProjectConfig;
  chain: string;
  tier: string;
}

export interface GenerationResponse {
  projectId: string;
  status: 'generating' | 'completed' | 'failed';
  estimatedTime: string;
  webhookUrl?: string;
}

export interface ArtifactResponse {
  projectId: string;
  status: 'completed' | 'failed';
  artifacts: GeneratedArtifacts;
  deploymentKey: string;
  updateAvailable: boolean;
}

export interface DeploymentRequest {
  environment: 'testnet' | 'mainnet';
  deployContracts: boolean;
  deployFrontend: boolean;
  customDomain?: string;
}

export interface DeploymentResponse {
  deploymentId: string;
  status: 'deploying' | 'completed' | 'failed';
  progress: {
    contracts: string;
    frontend: string;
    dns: string;
  };
  estimatedCompletion: string;
}

export interface DeploymentCompleted {
  deploymentId: string;
  contracts: Record<string, string>;
  frontendUrl: string;
  explorerLinks: string[];
}

// Billing and Usage
export interface UsageEvent {
  customerId: string;
  operation: string;
  cost: number;
  timestamp: number;
  metadata: {
    projectId: string;
    template: string;
    chain: string;
  };
}

export interface APIKeyTier {
  FREE: 'free';
  STARTER: 'starter';
  PROFESSIONAL: 'pro';
  ENTERPRISE: 'enterprise';
}

export interface TierLimits {
  projects: number;
  templates: string[];
  features: string[];
  support: string;
}
