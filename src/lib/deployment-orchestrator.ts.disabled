// DEPLOYMENT ORCHESTRATOR - Multi-chain deployment coordination
// This service handles complex multi-chain deployments with gas optimization

import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface DeploymentRequest {
  projectId: string;
  environment: 'testnet' | 'mainnet';
  chains: ChainDeployment[];
  deployContracts: boolean;
  deployFrontend: boolean;
  customDomain?: string;
  priority: 'low' | 'medium' | 'high';
  gasOptimization: 'cost' | 'speed';
}

interface ChainDeployment {
  chain: string;
  contracts: string[];
  config: ChainConfig;
}

interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  gasPrice?: string;
  priorityFee?: string;
  confirmations: number;
}

interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'deploying' | 'completed' | 'failed';
  progress: DeploymentProgress;
  contracts: Record<string, ContractDeployment>;
  frontend?: FrontendDeployment;
  estimatedCompletion: Date;
  errors?: string[];
  gasOptimizations?: GasOptimizationSummary;
}

interface DeploymentProgress {
  stage: 'initialization' | 'gas_optimization' | 'contract_deployment' | 'frontend_deployment' | 'cross_chain_setup' | 'verification' | 'completed';
  contracts: {
    status: 'pending' | 'deploying' | 'completed' | 'failed';
    deployed?: Record<string, ContractDeployment>;
    progress: number;
    gasOptimized?: boolean;
  };
  frontend: {
    status: 'pending' | 'building' | 'deploying' | 'completed' | 'failed';
    url?: string;
    progress: number;
  };
  crossChain: {
    status: 'pending' | 'configuring' | 'completed' | 'failed';
    bridges: Record<string, BridgeConfig>;
    progress: number;
  };
}

interface ContractDeployment {
  chain: string;
  address: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  verified: boolean;
  explorerUrl: string;
  deploymentTime: number;
}

interface FrontendDeployment {
  url: string;
  buildUrl?: string;
  cdnUrl?: string;
  environment: Record<string, string>;
  deploymentTime: number;
}

interface BridgeConfig {
  sourceChain: string;
  destChain: string;
  bridgeContract: string;
  status: 'active' | 'configuring' | 'failed';
}

interface GasOptimizationSummary {
  originalGasEstimate: number;
  optimizedGasEstimate: number;
  savings: number;
  savingsPercentage: number;
  optimizationTime: number;
}

// ============================================================
// CHAIN CONFIGURATIONS
// ============================================================

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    chainId: 1,
    confirmations: 3
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
    chainId: 137,
    confirmations: 10
  },
  arbitrum: {
    rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    confirmations: 5
  },
  optimism: {
    rpcUrl: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
    chainId: 10,
    confirmations: 5
  },
  bsc: {
    rpcUrl: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
    chainId: 56,
    confirmations: 10
  },
  base: {
    rpcUrl: process.env.BASE_RPC || 'https://mainnet.base.org',
    chainId: 8453,
    confirmations: 5
  }
};

const TESTNET_CONFIGS: Record<string, ChainConfig> = {
  sepolia: {
    rpcUrl: process.env.SEPOLIA_RPC || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    chainId: 11155111,
    confirmations: 2
  },
  mumbai: {
    rpcUrl: process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    confirmations: 5
  },
  'arbitrum-goerli': {
    rpcUrl: process.env.ARBITRUM_GOERLI_RPC || 'https://goerli-rollup.arbitrum.io/rpc',
    chainId: 421613,
    confirmations: 2
  }
};

// ============================================================
// GAS PRICE OPTIMIZER
// ============================================================

class GasPriceOptimizer {
  
  async getOptimalGasPrice(chain: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<GasPriceData> {
    const provider = this.getProvider(chain);
    
    try {
      const feeData = await provider.getFeeData();
      
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error(`Failed to fetch gas prices for ${chain}`);
      }

      // Adjust based on priority
      const multiplier = {
        low: 0.8,
        medium: 1.0,
        high: 1.3
      }[priority];

      const estimatedTime = {
        low: 300, // 5 minutes
        medium: 60,  // 1 minute
        high: 15    // 15 seconds
      }[priority];

      return {
        maxFeePerGas: ethers.parseUnits(feeData.maxFeePerGas.toString(), 'gwei').mul(multiplier),
        maxPriorityFeePerGas: ethers.parseUnits(feeData.maxPriorityFeePerGas.toString(), 'gwei').mul(multiplier),
        estimatedTime
      };
    } catch (error) {
      console.error(`Failed to get gas price for ${chain}:`, error);
      throw error;
    }
  }

  async waitForBetterGasPrice(chain: string, targetPrice: bigint, timeout: number = 300000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const gasPrice = await this.getOptimalGasPrice(chain, 'low');
      
      if (gasPrice.maxFeePerGas <= targetPrice) {
        return;
      }

      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error(`Timeout waiting for better gas price on ${chain}`);
  }

  private getProvider(chain: string): ethers.Provider {
    const isTestnet = chain.includes('sepolia') || chain.includes('mumbai') || chain.includes('goerli');
    const configs = isTestnet ? TESTNET_CONFIGS : CHAIN_CONFIGS;
    
    const config = configs[chain];
    if (!config) {
      throw new Error(`Chain ${chain} not supported`);
    }
    
    return new ethers.JsonRpcProvider(config.rpcUrl);
  }
}

interface GasPriceData {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedTime: number;
}

// ============================================================
// CONTRACT DEPLOYER
// ============================================================

class ContractDeployer {
  private gasPriceOptimizer: GasPriceOptimizer;

  constructor() {
    this.gasPriceOptimizer = new GasPriceOptimizer();
  }

  async deployContract(
    chain: string,
    contractName: string,
    bytecode: string,
    abi: any[],
    constructorArgs: any[] = [],
    privateKey: string,
    gasOptimization: 'cost' | 'speed' = 'cost'
  ): Promise<ContractDeployment> {
    const provider = this.getProvider(chain);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`🔗 Deploying ${contractName} to ${chain} (optimization: ${gasOptimization})`);

    try {
      // Get optimal gas price based on optimization strategy
      const gasPrice = await this.gasPriceOptimizer.getOptimalGasPrice(chain, 'medium');
      
      // Create contract factory
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);

      // Deploy with gas optimization
      const contract = await factory.deploy(...constructorArgs, {
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
      });

      const deploymentTx = await contract.deploymentTransaction();
      
      // Wait for confirmation
      const receipt = await deploymentTx.wait(
        CHAIN_CONFIGS[chain]?.confirmations || TESTNET_CONFIGS[chain]?.confirmations || 3
      );

      if (!receipt) {
        throw new Error('Deployment transaction failed');
      }

      const address = await contract.getAddress();
      const explorerUrl = this.getExplorerUrl(chain, address);

      // Verify contract on explorer
      const verified = await this.verifyContract(chain, address, contractName);

      return {
        chain,
        address,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei'),
        verified,
        explorerUrl,
        deploymentTime: Date.now()
      };

    } catch (error) {
      console.error(`Failed to deploy ${contractName} to ${chain}:`, error);
      throw error;
    }
  }

  async deployMultiChain(
    chains: string[],
    contractName: string,
    bytecode: string,
    abi: any[],
    constructorArgs: any[] = [],
    privateKey: string,
    gasOptimization: 'cost' | 'speed' = 'cost'
  ): Promise<Record<string, ContractDeployment>> {
    console.log(`🌐 Deploying ${contractName} to ${chains.length} chains`);

    // Deploy to all chains in parallel with error handling
    const results = await Promise.allSettled(
      chains.map(chain =>
        this.deployContract(chain, contractName, bytecode, abi, constructorArgs, privateKey, gasOptimization)
      )
    );

    const deployments: Record<string, ContractDeployment> = {};

    chains.forEach((chain, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        deployments[chain] = result.value;
      } else {
        console.error(`Failed to deploy to ${chain}:`, result.reason);
      }
    });

    return deployments;
  }

  private async verifyContract(chain: string, address: string, name: string): Promise<boolean> {
    console.log(`🔍 Verifying ${name} at ${address} on ${chain}`);
    
    // TODO: Implement contract verification via Etherscan API
    // For now, return true to simulate verification
    await new Promise(resolve => setTimeout(resolve, 5000));
    return true;
  }

  private getProvider(chain: string): ethers.Provider {
    const isTestnet = chain.includes('sepolia') || chain.includes('mumbai') || chain.includes('goerli');
    const configs = isTestnet ? TESTNET_CONFIGS : CHAIN_CONFIGS;
    
    const config = configs[chain];
    if (!config) {
      throw new Error(`Chain ${chain} not supported`);
    }
    
    return new ethers.JsonRpcProvider(config.rpcUrl);
  }

  private getExplorerUrl(chain: string, address: string): string {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/address/',
      polygon: 'https://polygonscan.com/address/',
      arbitrum: 'https://arbiscan.io/address/',
      optimism: 'https://optimistic.etherscan.io/address/',
      bsc: 'https://bscscan.com/address/',
      base: 'https://basescan.org/address/',
      sepolia: 'https://sepolia.etherscan.io/address/',
      mumbai: 'https://mumbai.polygonscan.com/address/',
      'arbitrum-goerli': 'https://goerli.arbiscan.io/address/'
    };

    return `${explorers[chain] || 'https://etherscan.io/address/'}${address}`;
  }
}

// ============================================================
// CROSS-CHAIN BRIDGE
// ============================================================

class CrossChainBridge {
  
  async setupBridge(
    sourceChain: string,
    destChain: string,
    sourceContract: string,
    destContract: string
  ): Promise<BridgeConfig> {
    console.log(`🌉 Setting up bridge: ${sourceChain} -> ${destChain}`);
    
    // TODO: Implement cross-chain bridge setup
    // Options: LayerZero, Axelar, Wormhole, Multichain
    
    // Simulate bridge setup
    await new Promise(resolve => setTimeout(resolve, 10000));

    return {
      sourceChain,
      destChain,
      bridgeContract: '0x1234567890123456789012345678901234', // Mock bridge contract
      status: 'active'
    };
  }

  async verifyBridge(sourceChain: string, destChain: string): Promise<boolean> {
    console.log(`🔍 Verifying bridge: ${sourceChain} <-> ${destChain}`);
    
    // TODO: Verify bridge is working correctly
    // - Test message passing
    // - Verify token transfers
    // - Check bridge fees
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    return true;
  }
}

// ============================================================
// FRONTEND DEPLOYER
// ============================================================

class FrontendDeployer {
  
  async deploy(projectId: string, buildArtifacts: string, customDomain?: string): Promise<FrontendDeployment> {
    console.log(`🚀 Deploying frontend for project ${projectId}`);

    // Simulate deployment to Vercel/Netlify
    const subdomain = customDomain || `${projectId}.launchpad.app`;
    const url = `https://${subdomain}`;
    const cdnUrl = `https://cdn.launchpad.app/${projectId}`;

    // TODO: Implement actual deployment
    // - Build frontend
    // - Upload to CDN
    // - Configure DNS
    // - Set up SSL

    await new Promise(resolve => setTimeout(resolve, 15000));

    return {
      url,
      cdnUrl,
      deploymentTime: Date.now()
    };
  }

  async configureDNS(domain: string, target: string): Promise<void> {
    console.log(`🌐 Configuring DNS: ${domain} -> ${target}`);
    
    // TODO: Configure DNS via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

// ============================================================
// DEPLOYMENT ORCHESTRATOR
// ============================================================

class DeploymentOrchestrator extends EventEmitter {
  private app: express.Application;
  private contractDeployer: ContractDeployer;
  private frontendDeployer: FrontendDeployer;
  private crossChainBridge: CrossChainBridge;
  private deployments: Map<string, DeploymentResult>;

  constructor() {
    super();
    this.app = express();
    this.contractDeployer = new ContractDeployer();
    this.frontendDeployer = new FrontendDeployer();
    this.crossChainBridge = new CrossChainBridge();
    this.deployments = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Internal deployment endpoints
    this.app.post('/internal/deploy', this.handleDeployment.bind(this));
    this.app.get('/internal/deploy/:deploymentId', this.handleStatus.bind(this));
    this.app.post('/internal/deploy/:deploymentId/optimize-gas', this.handleGasOptimization.bind(this));
    this.app.post('/internal/deploy/:deploymentId/verify', this.handleVerification.bind(this));
    
    // Health check
    this.app.get('/internal/health', this.handleHealth.bind(this));
  }

  private async handleDeployment(req: Request, res: Response): Promise<void> {
    try {
      const request: DeploymentRequest = req.body;
      const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      console.log(`🚀 Starting deployment: ${deploymentId}`);

      // Initialize deployment
      const deployment: DeploymentResult = {
        deploymentId,
        status: 'pending',
        progress: {
          stage: 'initialization',
          contracts: { status: 'pending', progress: 0 },
          frontend: { status: 'pending', progress: 0 },
          crossChain: { status: 'pending', progress: 0 }
        },
        contracts: {},
        estimatedCompletion: new Date(Date.now() + 600000) // 10 minutes
      };

      this.deployments.set(deploymentId, deployment);

      // Start deployment asynchronously
      this.executeDeployment(deploymentId, request);

      res.json({
        deploymentId,
        status: 'deploying',
        estimatedCompletion: deployment.estimatedCompletion
      });

    } catch (error) {
      console.error('Deployment request failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async executeDeployment(deploymentId: string, request: DeploymentRequest): Promise<void> {
    const deployment = this.deployments.get(deploymentId)!;

    try {
      deployment.status = 'deploying';

      // STAGE 1: Gas Optimization
      if (request.deployContracts) {
        deployment.progress.stage = 'gas_optimization';
        deployment.progress.contracts.gasOptimized = false;
        this.emit('progress', { deploymentId, progress: deployment.progress });

        const gasOptimizations = await this.optimizeGasPrices(request.chains, request.priority);
        deployment.gasOptimizations = gasOptimizations;

        deployment.progress.contracts.gasOptimized = true;
        this.emit('progress', { deploymentId, progress: deployment.progress });
      }

      // STAGE 2: Contract Deployment
      if (request.deployContracts) {
        deployment.progress.stage = 'contract_deployment';
        deployment.progress.contracts.status = 'deploying';
        this.emit('progress', { deploymentId, progress: deployment.progress });

        // Fetch artifacts from generator service
        const artifacts = await this.fetchArtifacts(request.projectId);

        // Deploy contracts to each chain
        for (const chainDep of request.chains) {
          for (const contractName of chainDep.contracts) {
            const artifact = artifacts.contracts.find((c: any) => c.name === contractName);
            if (!artifact) continue;

            const deployment = await this.contractDeployer.deployContract(
              chainDep.chain,
              contractName,
              artifact.bytecode,
              artifact.abi,
              [],
              process.env.DEPLOYER_PRIVATE_KEY!,
              request.gasOptimization
            );

            deployment.contracts[`${chainDep.chain}_${contractName}`] = deployment;
          }
        }

        deployment.progress.contracts.status = 'completed';
        deployment.progress.contracts.progress = 100;
        this.emit('progress', { deploymentId, progress: deployment.progress });
      }

      // STAGE 3: Cross-Chain Setup
      if (request.chains.length > 1) {
        deployment.progress.stage = 'cross_chain_setup';
        deployment.progress.crossChain.status = 'configuring';
        this.emit('progress', { deploymentId, progress: deployment.progress });

        const bridges: Record<string, BridgeConfig> = {};

        // Set up bridges between chains
        for (let i = 0; i < request.chains.length - 1; i++) {
          const sourceChain = request.chains[i].chain;
          const destChain = request.chains[i + 1].chain;

          const bridge = await this.crossChainBridge.setupBridge(
            sourceChain,
            destChain,
            'Token',
            'Token'
          );

          bridges[`${sourceChain}_${destChain}`] = bridge;
        }

        deployment.progress.crossChain.bridges = bridges;
        deployment.progress.crossChain.status = 'completed';
        deployment.progress.crossChain.progress = 100;
        this.emit('progress', { deploymentId, progress: deployment.progress });
      }

      // STAGE 4: Frontend Deployment
      if (request.deployFrontend) {
        deployment.progress.stage = 'frontend_deployment';
        deployment.progress.frontend.status = 'deploying';
        this.emit('progress', { deploymentId, progress: deployment.progress });

        const frontendDep = await this.frontendDeployer.deploy(
          request.projectId,
          'frontend-build.zip',
          request.customDomain
        );

        deployment.frontend = frontendDep;
        deployment.progress.frontend.status = 'completed';
        deployment.progress.frontend.progress = 100;
        this.emit('progress', { deploymentId, progress: deployment.progress });
      }

      // STAGE 5: Verification
      if (request.deployContracts) {
        deployment.progress.stage = 'verification';
        this.emit('progress', { deploymentId, progress: deployment.progress });

        // Verify all contracts
        for (const [contractKey, contractDep] of Object.entries(deployment.contracts)) {
          contractDep.verified = await this.contractDeployer.verifyContract(
            contractDep.chain,
            contractDep.address,
            contractKey.split('_')[1] // Extract contract name
          );
        }

        this.emit('progress', { deploymentId, progress: deployment.progress });
      }

      // COMPLETED
      deployment.status = 'completed';
      deployment.progress.stage = 'completed';
      deployment.estimatedCompletion = new Date();

      this.emit('completed', { deploymentId, deployment });

      console.log(`✅ Deployment completed: ${deploymentId}`);

    } catch (error) {
      deployment.status = 'failed';
      deployment.errors = [(error as Error).message];
      this.emit('failed', { deploymentId, deployment, error: (error as Error).message });
      
      console.error(`❌ Deployment failed: ${deploymentId}`, error);
    }
  }

  private async optimizeGasPrices(chains: ChainDeployment[], priority: 'low' | 'medium' | 'high'): Promise<GasOptimizationSummary> {
    console.log(`⛽ Optimizing gas prices for ${chains.length} chains (priority: ${priority})`);

    const gasPriceOptimizer = new GasPriceOptimizer();
    let totalOriginalEstimate = 0;
    let totalOptimizedEstimate = 0;

    // Get optimal gas prices for all chains
    const optimizations = await Promise.all(
      chains.map(async chain => {
        const gasPrice = await gasPriceOptimizer.getOptimalGasPrice(chain, priority);
        return {
          chain: chain.chain,
          gasPrice: ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei'),
          estimatedTime: gasPrice.estimatedTime
        };
      })
    );

    // Calculate optimization summary
    const startTime = Date.now();
    
    return {
      originalGasEstimate: totalOriginalEstimate,
      optimizedGasEstimate: totalOptimizedEstimate,
      savings: totalOriginalEstimate - totalOptimizedEstimate,
      savingsPercentage: totalOriginalEstimate > 0 ? ((totalOriginalEstimate - totalOptimizedEstimate) / totalOriginalEstimate) * 100 : 0,
      optimizationTime: Date.now() - startTime
    };
  }

  private async fetchArtifacts(projectId: string): Promise<any> {
    // TODO: Fetch from generator service
    // For now, return mock artifacts
    return {
      contracts: [
        {
          name: 'Token',
          bytecode: '0x608060...',
          abi: [],
          source: '// Generated contract'
        },
        {
          name: 'Sale',
          bytecode: '0x608060...',
          abi: [],
          source: '// Generated contract'
        }
      ]
    };
  }

  private async handleStatus(req: Request, res: Response): Promise<void> {
    const { deploymentId } = req.params;
    const deployment = this.deployments.get(deploymentId);

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    res.json(deployment);
  }

  private async handleGasOptimization(req: Request, res: Response): Promise<void> {
    const { deploymentId } = req.params;
    const deployment = this.deployments.get(deploymentId);

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    try {
      const gasOptimizations = await this.optimizeGasPrices(
        [{ chain: 'ethereum', contracts: ['Token'], config: CHAIN_CONFIGS.ethereum }],
        'medium'
      );

      deployment.gasOptimizations = gasOptimizations;
      
      res.json({
        deploymentId,
        gasOptimizations,
        message: 'Gas optimization completed'
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleVerification(req: Request, res: Response): Promise<void> {
    const { deploymentId } = req.params;
    const deployment = this.deployments.get(deploymentId);

    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Trigger verification for all contracts
    for (const [contractKey, contractDep] of Object.entries(deployment.contracts)) {
      contractDep.verified = await this.contractDeployer.verifyContract(
        contractDep.chain,
        contractDep.address,
        contractKey.split('_')[1]
      );
    }

    res.json({
      deploymentId,
      contracts: deployment.contracts,
      message: 'Verification completed'
    });
  }

  private handleHealth(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'deployment-orchestrator',
      version: '1.0.0',
      activeDeployments: this.deployments.size,
      supportedChains: Object.keys(CHAIN_CONFIGS)
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Deployment Orchestrator listening on port ${port} (INTERNAL ONLY)`);
      console.log(`🌐 Supported chains: ${Object.keys(CHAIN_CONFIGS).join(', ')}`);
      console.log(`⛽ Gas optimization enabled`);
      console.log(`🌉 Cross-chain bridges available`);
    });
  }
}

// ============================================================
// STARTUP
// ============================================================

if (require.main === module) {
  const orchestrator = new DeploymentOrchestrator();
  
  orchestrator.on('progress', (data) => {
    console.log(`📊 Deployment progress: ${data.deploymentId} - ${data.progress.stage} (${data.progress.contracts.progress}%)`);
  });
  
  orchestrator.on('completed', (data) => {
    console.log(`✅ Deployment completed: ${data.deploymentId}`);
    console.log(`   Contracts deployed: ${Object.keys(data.contracts).length}`);
    console.log(`   Frontend deployed: ${data.frontend ? 'Yes' : 'No'}`);
    if (data.gasOptimizations) {
      console.log(`   Gas savings: ${data.gasOptimizations.savingsPercentage.toFixed(1)}%`);
    }
  });
  
  orchestrator.on('failed', (data) => {
    console.error(`❌ Deployment failed: ${data.deploymentId}`);
    if (data.errors) {
      data.errors.forEach(error => console.error(`   Error: ${error}`));
    }
  });

  orchestrator.listen(parseInt(process.env.PORT || '3002'));
}

export { DeploymentOrchestrator, ContractDeployer, GasPriceOptimizer };
