import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIGenerationParams {
  projectName: string;
  projectDescription: string;
  projectType: 'dapp' | 'token' | 'both';
  features: string[];
  tokenConfig?: {
    name: string;
    symbol: string;
    totalSupply: number;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface AIGenerationResult {
  files: GeneratedFile[];
  packageJson: any;
  readme: string;
  totalFiles: number;
  totalLines: number;
  tokensUsed: number;
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private provider: 'openai' | 'anthropic';
  private model: string;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as 'openai' | 'anthropic') || 'openai';

    if (this.provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
    }
  }

  async generateDApp(params: AIGenerationParams): Promise<AIGenerationResult> {
    const prompt = this.buildPrompt(params);

    if (this.provider === 'openai') {
      return this.generateWithOpenAI(prompt);
    } else {
      return this.generateWithAnthropic(prompt);
    }
  }

  private buildPrompt(params: AIGenerationParams): string {
    const { projectName, projectDescription, projectType, features, tokenConfig } = params;

    let prompt = `You are an expert Solana dApp developer. Generate a complete, production-ready Next.js 14 project with the following specifications:

PROJECT NAME: ${projectName}
PROJECT DESCRIPTION: ${projectDescription}
PROJECT TYPE: ${projectType}

REQUIRED FEATURES:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

TECHNICAL REQUIREMENTS:
- Next.js 14 with App Router
- TypeScript with strict mode
- Solana wallet integration (@solana/wallet-adapter)
- Tailwind CSS for styling
- Responsive design
- Clean, documented code
- Error handling and loading states
- Type safety throughout

`;

    if (tokenConfig && (projectType === 'token' || projectType === 'both')) {
      prompt += `
TOKEN CONFIGURATION:
- Name: ${tokenConfig.name}
- Symbol: ${tokenConfig.symbol}
- Total Supply: ${tokenConfig.totalSupply}
- Include SPL token minting functionality
- Include token metadata setup

`;
    }

    prompt += `
OUTPUT FORMAT:
Provide the complete project structure as a JSON object with this exact format:
{
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "content": "file content here",
      "language": "typescript"
    }
  ],
  "packageJson": { ... package.json content as object ... },
  "readme": "README.md content here"
}

IMPORTANT GUIDELINES:
1. Include ALL necessary files (components, pages, utilities, config files)
2. Use modern React patterns (hooks, composition, TypeScript)
3. Implement proper error boundaries and loading states
4. Include comprehensive comments in complex logic
5. Follow Next.js 14 best practices (app router, server/client components)
6. Ensure wallet integration is production-ready
7. Include proper TypeScript types and interfaces
8. Add basic tests if relevant
9. Make UI responsive and accessible
10. Include environment variable examples

Start generating the project now. Return ONLY the JSON object, no additional text.`;

    return prompt;
  }

  private async generateWithOpenAI(prompt: string): Promise<AIGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Solana dApp developer specializing in Next.js and TypeScript. You generate complete, production-ready code.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      const result = JSON.parse(response);
      const totalLines = this.calculateTotalLines(result.files);

      return {
        files: result.files,
        packageJson: result.packageJson,
        readme: result.readme,
        totalFiles: result.files.length,
        totalLines,
        tokensUsed: completion.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  private async generateWithAnthropic(prompt: string): Promise<AIGenerationResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.7,
        system: 'You are an expert Solana dApp developer specializing in Next.js and TypeScript. You generate complete, production-ready code. Always respond with valid JSON.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      const result = JSON.parse(content.text);
      const totalLines = this.calculateTotalLines(result.files);

      return {
        files: result.files,
        packageJson: result.packageJson,
        readme: result.readme,
        totalFiles: result.files.length,
        totalLines,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      };
    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw error;
    }
  }

  private calculateTotalLines(files: GeneratedFile[]): number {
    return files.reduce((total, file) => {
      return total + file.content.split('\n').length;
    }, 0);
  }

  async analyzeCodeSecurity(files: GeneratedFile[]): Promise<{
    riskScore: number;
    flags: Array<{
      type: 'security' | 'legal' | 'content';
      severity: 'low' | 'medium' | 'high';
      message: string;
      file?: string;
      line?: number;
    }>;
  }> {
    const flags: any[] = [];
    let totalRisk = 0;

    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() detected', severity: 'high', risk: 30 },
      { pattern: /dangerouslySetInnerHTML/, message: 'Use of dangerouslySetInnerHTML detected', severity: 'medium', risk: 15 },
      { pattern: /process\.env\.[A-Z_]+(?!NEXT_PUBLIC)/, message: 'Server-side env var used in client code', severity: 'high', risk: 25 },
      { pattern: /localStorage\.setItem.*privateKey|secretKey/, message: 'Potential private key storage in localStorage', severity: 'high', risk: 40 },
      { pattern: /Math\.random\(\).*crypto|private|key/, message: 'Insecure random number generation for crypto', severity: 'high', risk: 35 },
      { pattern: /\.innerHTML\s*=/, message: 'Direct innerHTML manipulation', severity: 'medium', risk: 10 },
    ];

    for (const file of files) {
      const lines = file.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const { pattern, message, severity, risk } of securityPatterns) {
          if (pattern.test(line)) {
            flags.push({
              type: 'security',
              severity,
              message,
              file: file.path,
              line: i + 1,
            });
            totalRisk += risk;
          }
        }
      }
    }

    const riskScore = Math.min(100, totalRisk);

    return {
      riskScore,
      flags,
    };
  }
}

export default new AIService();
