import archiver from 'archiver';
import { createWriteStream, promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import type { GeneratedFile } from './AIService';

export class FilePackagingService {
  private outputDir: string;
  private maxRetentionHours: number;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'temp', 'downloads');
    this.maxRetentionHours = parseInt(process.env.TEMP_FILE_RETENTION_HOURS || '24', 10);
  }

  async packageProject(params: {
    generationId: string;
    projectName: string;
    files: GeneratedFile[];
    packageJson: any;
    readme: string;
  }): Promise<{
    zipPath: string;
    downloadToken: string;
    expiresAt: Date;
  }> {
    const { generationId, projectName, files, packageJson, readme } = params;

    await fs.mkdir(this.outputDir, { recursive: true });

    const downloadToken = nanoid(32);
    const sanitizedName = projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const zipFilename = `${sanitizedName}-${generationId}.zip`;
    const zipPath = path.join(this.outputDir, zipFilename);

    return new Promise((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', () => {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.maxRetentionHours);

        resolve({
          zipPath,
          downloadToken,
          expiresAt,
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      archive.append(JSON.stringify(packageJson, null, 2), {
        name: 'package.json',
      });

      archive.append(readme, {
        name: 'README.md',
      });

      for (const file of files) {
        archive.append(file.content, {
          name: file.path,
        });
      }

      this.addConfigFiles(archive);

      archive.finalize();
    });
  }

  private addConfigFiles(archive: archiver.Archiver): void {
    const gitignore = `# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/
build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

    archive.append(gitignore, { name: '.gitignore' });

    const envExample = `# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Add your environment variables here
`;

    archive.append(envExample, { name: '.env.example' });

    const eslintConfig = {
      extends: 'next/core-web-vitals',
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    };

    archive.append(JSON.stringify(eslintConfig, null, 2), { name: '.eslintrc.json' });

    const tsconfig = {
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
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    archive.append(JSON.stringify(tsconfig, null, 2), { name: 'tsconfig.json' });
  }

  async cleanupExpiredFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);
        const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

        if (ageHours > this.maxRetentionHours) {
          await fs.unlink(filePath);
          console.log(`Cleaned up expired file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async getDownloadFile(zipPath: string): Promise<Buffer> {
    try {
      return await fs.readFile(zipPath);
    } catch (error) {
      console.error('File read error:', error);
      throw new Error('Download file not found or expired');
    }
  }
}

export default new FilePackagingService();
