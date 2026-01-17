import { GenerationType, ProjectType } from '@/types/generator';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'contract' | 'frontend' | 'config' | 'documentation';
}

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

export interface DAppGenerationResult {
  files: GeneratedFile[];
  packageJson: any;
  readme: string;
  totalFiles: number;
  totalLines: number;
  tokensUsed?: number;
}

export interface SecurityAnalysisResult {
  riskScore: number;
  flags: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    line?: number;
  }>;
}

export class AIService {
  private config: AIServiceConfig;
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private provider: 'openai' | 'anthropic';

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.provider = (process.env.AI_PROVIDER as 'openai' | 'anthropic') || 'openai';

    if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || config.apiKey,
      });
    } else {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || config.apiKey,
      });
    }
  }

  private buildPrompt(projectType: ProjectType, tier: string, features: string[], tokenConfig?: any): string {
    const basePrompt = `You are an expert Solana blockchain developer. Create a complete, production-ready ${projectType} dApp with the following specifications:

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
    } catch (error: any) {
      console.error('AI generation error:', error);
      return {
        success: false,
        errors: [error?.message || 'Unknown error occurred'],
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
    } catch (error: any) {
      console.error('Validation error:', error);
      return {
        success: false,
        errors: [error?.message || 'Validation failed'],
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
    } catch (error: any) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  async generateDApp(params: {
    projectName: string;
    projectDescription: string;
    projectType: ProjectType;
    features: string[];
    tokenConfig?: any;
  }): Promise<DAppGenerationResult> {
    try {
      const prompt = `Generate a complete Solana dApp project with the following specifications:

Project Name: ${params.projectName}
Description: ${params.projectDescription}
Type: ${params.projectType}
Features: ${params.features.join(', ')}

${params.tokenConfig ? `Token Configuration:
- Name: ${params.tokenConfig.name}
- Symbol: ${params.tokenConfig.symbol}
- Supply: ${params.tokenConfig.supply}` : ''}

Generate a production-ready Next.js 14 app with:
1. Solana wallet integration (@solana/wallet-adapter-react)
2. Smart contract interactions using @solana/web3.js
3. Modern UI with Tailwind CSS
4. TypeScript throughout
5. Proper error handling and loading states
6. Responsive design

Return ONLY a JSON object with this exact structure:
{
  "files": [
    {
      "path": "src/app/page.tsx",
      "content": "file content here",
      "type": "frontend"
    }
  ],
  "packageJson": {
    "name": "${params.projectName.toLowerCase().replace(/\s+/g, '-')}",
    "version": "1.0.0",
    "dependencies": {}
  },
  "readme": "README content",
  "totalFiles": 0,
  "totalLines": 0
}`;

      let result: any;
      let tokensUsed = 0;

      if (this.provider === 'openai' && this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Solana dApp developer. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 8000,
        });

        tokensUsed = completion.usage?.total_tokens || 0;
        const content = completion.choices[0]?.message?.content || '{}';
        result = JSON.parse(content);
      } else if (this.provider === 'anthropic' && this.anthropic) {
        const completion = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system: 'You are an expert Solana dApp developer. Always respond with valid JSON only. Do not include any text before or after the JSON object.'
        });

        const textContent = completion.content[0];
        if (textContent.type === 'text') {
          result = JSON.parse(textContent.text);
        }
        tokensUsed = completion.usage.input_tokens + completion.usage.output_tokens;
      } else {
        throw new Error('No AI provider configured');
      }

      // Ensure proper structure
      if (!result.files || !Array.isArray(result.files)) {
        result.files = [];
      }

      if (!result.packageJson) {
        result.packageJson = {
          name: params.projectName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          dependencies: {}
        };
      }

      if (!result.readme) {
        result.readme = `# ${params.projectName}\n\n${params.projectDescription}`;
      }

      result.totalFiles = result.files.length;
      result.totalLines = result.files.reduce((sum: number, f: GeneratedFile) =>
        sum + (f.content.split('\n').length), 0);
      result.tokensUsed = tokensUsed;

      return result as DAppGenerationResult;
    } catch (error: any) {
      console.error('AI generation error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async analyzeCodeSecurity(files: GeneratedFile[]): Promise<SecurityAnalysisResult> {
    try {
      const flags: SecurityAnalysisResult['flags'] = [];
      let riskScore = 0;

      // Security pattern analysis
      const dangerousPatterns = [
        { pattern: /eval\s*\(/gi, severity: 'high' as const, type: 'eval-usage', points: 30, desc: 'Dangerous eval() usage detected' },
        { pattern: /dangerouslySetInnerHTML/gi, severity: 'high' as const, type: 'xss-risk', points: 25, desc: 'XSS risk with dangerouslySetInnerHTML' },
        { pattern: /localStorage\.setItem.*privateKey/gi, severity: 'critical' as const, type: 'key-storage', points: 40, desc: 'Private key stored in localStorage' },
        { pattern: /\.innerHTML\s*=/gi, severity: 'medium' as const, type: 'xss-risk', points: 15, desc: 'Potential XSS with innerHTML' },
        { pattern: /process\.env\.[A-Z_]+/gi, severity: 'low' as const, type: 'env-exposure', points: 5, desc: 'Environment variable usage - ensure not exposed to client' },
        { pattern: /Math\.random\(\)/gi, severity: 'medium' as const, type: 'weak-random', points: 10, desc: 'Weak randomness - use crypto.randomBytes for security-critical operations' },
      ];

      for (const file of files) {
        for (const { pattern, severity, type, points, desc } of dangerousPatterns) {
          const matches = file.content.match(pattern);
          if (matches) {
            flags.push({
              severity,
              type,
              description: `${desc} in ${file.path}`,
              line: undefined
            });
            riskScore += points * matches.length;
          }
        }
      }

      // Normalize risk score to 0-100
      riskScore = Math.min(100, riskScore);

      return {
        riskScore,
        flags
      };
    } catch (error: any) {
      console.error('Security analysis error:', error);
      return {
        riskScore: 0,
        flags: []
      };
    }
  }
}

// Create singleton instance
const aiServiceInstance = new AIService({
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  model: 'gpt-4',
  maxTokens: 8000,
  temperature: 0.7
});

// Default export for the service
export default aiServiceInstance;
