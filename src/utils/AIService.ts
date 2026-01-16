import { GenerationType, ProjectType } from '@/types/generator';

export interface AIServiceConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  maxTokens: number;
  temperature: number;
}

export interface AIGenerationResult {
  success: boolean;
  jobId?: string;
  output?: {
    files: Array<{
      name: string;
      content: string;
      type: 'contract' | 'frontend' | 'config' | 'documentation';
    }>;
    transactionHash?: string;
    contractAddress?: string;
    deploymentUrl?: string;
  };
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  private buildPrompt(projectType: ProjectType, tier: string, features: string[], tokenConfig?: any): string {
    const basePrompt = `You are an expert Web3 developer and smart contract auditor. Create a complete, production-ready ${projectType} with the following specifications:

PROJECT TYPE: ${projectType}
TIER: ${tier}
FEATURES: ${features.join(', ')}

${tokenConfig ? `
TOKEN CONFIGURATION:
- Name: ${tokenConfig.name}
- Symbol: ${tokenConfig.symbol}
- Total Supply: ${tokenConfig.totalSupply}
- Decimals: ${tokenConfig.decimals}
` : ''}

REQUIREMENTS:
1. Use Solidity ^0.8.20
2. Follow OpenZeppelin standards for security
3. Include comprehensive error handling
4. Add events for all major operations
5. Optimize for gas efficiency
6. Include access control mechanisms
7. Add detailed NatSpec comments
8. Include upgradeability patterns if applicable
9. Include security considerations
10. Include gas optimization analysis
11. Provide comprehensive documentation
12. Include test cases
13. Use industry-standard naming conventions
14. Follow ERC20/ERC721 standards as applicable
15. Include pausable/pausable patterns if needed
16. Include mint/burn functionality
17. Include vesting mechanisms
18. Include role-based access control
19. Include emergency functions
20. Include comprehensive event logging
21. Include upgradeability patterns
22. Include proxy patterns for upgradeability
23. Include timelock mechanisms
24. Include reentrancy protection
25. Include overflow/underflow protection
26. Include mathematical precision
27. Include safe math operations
28. Include batch operations support
29. Include metadata extensions
30. Include EIP-165/712 compatibility
31. Include multi-signature support
32. Include delegation mechanisms
33. Include permit/allowance patterns
34. Include flash loan protection
35. Include governance token features
36. Include tax/fee mechanisms
37. Include snapshot/revert mechanisms
38. Include cross-chain compatibility
39. Include oracle integration patterns
40. Include staking mechanisms
41. Include yield farming patterns
42. Include liquidity pool patterns
43. Include automated market maker patterns
44. Include DEX integration patterns
45. Include NFT marketplace patterns
46. Include gaming token patterns
47. Include social token patterns
48. Include compliance features
49. Include audit trail features
50. Include regulatory compliance features`;

    return basePrompt;
  }

  async generateProject(params: {
    projectName: string;
    projectDescription: string;
    projectType: ProjectType;
    tier: string;
    features: string[];
    tokenConfig?: any;
    customRequirements?: string;
  }): Promise<AIGenerationResult> {
    try {
      const prompt = this.buildPrompt(
        params.projectType,
        params.tier,
        params.features,
        params.tokenConfig
      );

      // Call AI service (implementation depends on your AI provider)
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a Web3 expert assistant. Help me create a complete dApp.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error('AI service request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        errors: [error.message || 'Unknown error occurred'],
      };
    }
  }

  async validateGeneration(jobId: string): Promise<AIGenerationResult> {
    try {
      const response = await fetch(`/api/ai/validate/${jobId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Validation error:', error);
      return {
        success: false,
        errors: [error.message || 'Validation failed'],
      };
    }
  }

  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await fetch(`/api/ai/status/${jobId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Status request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }
}
