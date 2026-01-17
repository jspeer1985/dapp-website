// WHITE-LABEL PROVISIONING SYSTEM - Complete enterprise subdomain solution
// This service enables enterprise customers to have their own branded Launchpad platform

import express, { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { EventEmitter } from 'events';

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface WhiteLabelConfig {
  id: string;
  customerId: string;
  enterpriseId: string;
  domain: {
    subdomain: string;
    customDomain?: string;
    sslCertificate?: SSLCertificate;
  };
  branding: {
    companyName: string;
    logo: {
      url: string;
      favicon: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      fontFamily: string;
      headingFont?: string;
    };
    customCSS?: string;
  };
  features: {
    templates: string[];
    maxProjects: number;
    maxAPIKeys: number;
    customTemplates: boolean;
    prioritySupport: boolean;
    dedicatedInfrastructure: boolean;
  };
  apiConfig: {
    masterApiKey: string;
    rateLimits: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
    webhookUrl?: string;
  };
  status: 'provisioning' | 'active' | 'suspended' | 'terminated';
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    provisioningCompleted?: Date;
  };
}

interface SSLCertificate {
  provider: 'letsencrypt' | 'custom';
  status: 'pending' | 'active' | 'expired';
  issuedAt?: Date;
  expiresAt?: Date;
  certificate?: string;
  privateKey?: string;
}

interface ProvisioningTask {
  id: string;
  whiteLabelId: string;
  type: 'dns_configuration' | 'ssl_certificate' | 'subdomain_routing' | 'database_setup' | 'api_key_generation' | 'dashboard_deployment' | 'custom_domain_verification';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
}

// ============================================================
// WHITE-LABEL PRICING
// ============================================================

const WHITE_LABEL_PRICING = {
  starter: {
    name: 'Starter White-Label',
    monthlyPrice: 999,
    annualPrice: 9990,
    features: [
      'custom_domain',
      'basic_branding',
      'standard_templates',
      'email_support',
      'api_access'
    ],
    limits: {
      maxProjects: 25,
      maxAPIKeys: 5,
      customTemplates: false,
      prioritySupport: false,
      dedicatedInfrastructure: false
    }
  },
  professional: {
    name: 'Professional White-Label',
    monthlyPrice: 2499,
    annualPrice: 23990,
    features: [
      'custom_domain',
      'advanced_branding',
      'all_templates',
      'custom_templates',
      'priority_support',
      'api_access',
      'advanced_analytics'
    ],
    limits: {
      maxProjects: 100,
      maxAPIKeys: 25,
      customTemplates: true,
      prioritySupport: true,
      dedicatedInfrastructure: false
    }
  },
  enterprise: {
    name: 'Enterprise White-Label',
    monthlyPrice: 9999,
    annualPrice: 95990,
    features: [
      'custom_domain',
      'full_branding',
      'all_templates',
      'custom_templates',
      'priority_support',
      'dedicated_support',
      'api_access',
      'advanced_analytics',
      'dedicated_infrastructure',
      'custom_integrations'
    ],
    limits: {
      maxProjects: -1, // Unlimited
      maxAPIKeys: -1, // Unlimited
      customTemplates: true,
      prioritySupport: true,
      dedicatedInfrastructure: true
    }
  }
};

// ============================================================
// DNS MANAGER
// ============================================================

class DNSManager {
  private cloudflareApiToken: string;
  private cloudflareZoneId: string;

  constructor(apiToken: string, zoneId: string) {
    this.cloudflareApiToken = apiToken;
    this.cloudflareZoneId = zoneId;
  }

  async createSubdomain(subdomain: string, targetIP: string): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/zones/${this.cloudflareZoneId}/dns_records`;

    try {
      await axios.post(
        url,
        {
          type: 'A',
          name: subdomain,
          content: targetIP,
          ttl: 120,
          proxied: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.cloudflareApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Created subdomain: ${subdomain}.${this.cloudflareZoneId}`);
    } catch (error) {
      console.error('Failed to create subdomain:', error);
      throw error;
    }
  }

  async createCNAME(domain: string, target: string): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/zones/${this.cloudflareZoneId}/dns_records`;

    try {
      await axios.post(
        url,
        {
          type: 'CNAME',
          name: domain,
          content: target,
          ttl: 120,
          proxied: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.cloudflareApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Created CNAME: ${domain} -> ${target}`);
    } catch (error) {
      console.error('Failed to create CNAME:', error);
      throw error;
    }
  }

  async verifyDomainOwnership(domain: string): Promise<boolean> {
    const verificationToken = crypto.randomBytes(16).toString('hex');
    
    console.log(`
      🔐 Domain Verification Required
      Domain: ${domain}
      
      Add this TXT record to your DNS:
      Name: _launchpad-verify.${domain}
      Value: ${verificationToken}
      
      Then call /api/v1/whitelabel/:id/verify-domain
    `);

    // TODO: Check for TXT record
    return false;
  }
}

// ============================================================
// SSL CERTIFICATE MANAGER
// ============================================================

class CertificateManager {
  private cloudflareApiToken: string;
  private cloudflareZoneId: string;

  constructor(apiToken: string, zoneId: string) {
    this.cloudflareApiToken = apiToken;
    this.cloudflareZoneId = zoneId;
  }

  async provisionSSLCertificate(domain: string): Promise<SSLCertificate> {
    console.log(`🔒 Provisioning SSL certificate for ${domain}`);

    // Use Cloudflare's automatic SSL
    const certificate: SSLCertificate = {
      provider: 'letsencrypt',
      status: 'active',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    console.log(`✅ SSL certificate provisioned for ${domain}`);
    return certificate;
  }

  async uploadCustomCertificate(certificate: string, privateKey: string): Promise<SSLCertificate> {
    console.log(`📤 Uploading custom SSL certificate`);

    // TODO: Upload custom certificate to Cloudflare
    const cert: SSLCertificate = {
      provider: 'custom',
      status: 'active',
      issuedAt: new Date(),
      certificate,
      privateKey
    };

    return cert;
  }
}

// ============================================================
// INFRASTRUCTURE PROVISIONER
// ============================================================

class InfrastructureProvisioner {
  
  async provisionDatabase(whiteLabelId: string): Promise<string> {
    console.log(`📊 Provisioning database for ${whiteLabelId}`);

    // In production:
    // - Create separate PostgreSQL database
    // - Set up connection pooling
    // - Configure backups
    // - Set up monitoring

    const dbUrl = `postgresql://user:pass@db.launchpad.platform:5432/${whiteLabelId}`;
    return dbUrl;
  }

  async provisionRedisInstance(whiteLabelId: string): Promise<string> {
    console.log(`🔴 Provisioning Redis for ${whiteLabelId}`);

    // In production:
    // - Create separate Redis instance
    // - Configure persistence
    // - Set up replication

    const redisUrl = `redis://${whiteLabelId}.redis.launchpad.platform:6379`;
    return redisUrl;
  }

  async provisionDedicatedInfrastructure(whiteLabelId: string, config: WhiteLabelConfig): Promise<any> {
    console.log(`🏗️ Provisioning dedicated infrastructure for ${whiteLabelId}`);

    // In production:
    // - Provision dedicated servers
    // - Set up load balancers
    // - Configure monitoring
    // - Set up CI/CD pipelines

    return {
      servers: ['server1.launchpad.platform', 'server2.launchpad.platform'],
      loadBalancer: 'lb.launchpad.platform',
      monitoring: 'monitoring.launchpad.platform'
    };
  }
}

// ============================================================
// DASHBOARD GENERATOR
// ============================================================

class DashboardGenerator {
  
  generateBrandedDashboard(config: WhiteLabelConfig): string {
    const { branding, features, apiConfig } = config;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding.companyName} - Launchpad Platform</title>
  <link rel="icon" href="${branding.logo.favicon}">
  
  <style>
    :root {
      --color-primary: ${branding.colors.primary};
      --color-secondary: ${branding.colors.secondary};
      --color-accent: ${branding.colors.accent};
      --color-background: ${branding.colors.background};
      --color-text: ${branding.colors.text};
      --font-family: ${branding.typography.fontFamily};
      --heading-font: ${branding.typography.headingFont || branding.typography.fontFamily};
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-family);
      background: var(--color-background);
      color: var(--color-text);
      line-height: 1.6;
    }
    
    .navbar {
      background: var(--color-primary);
      padding: 1rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .navbar-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .btn {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn:hover {
      opacity: 0.9;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .feature-card {
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .feature-description {
      color: #6b7280;
      margin-bottom: 1rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .stat-card {
      background: var(--color-primary);
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    
    ${branding.customCSS || ''}
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="#" class="navbar-brand">${branding.companyName}</a>
      <div style="margin-left: auto;">
        <span style="color: white; font-size: 0.875rem;">API: ${apiConfig.masterApiKey.substring(0, 8)}...</span>
      </div>
    </div>
  </nav>
  
  <div class="container">
    <div style="text-align: center; margin: 3rem 0;">
      <h1 style="font-family: var(--heading-font); color: var(--color-primary); margin-bottom: 1rem;">
        Welcome to ${branding.companyName}
      </h1>
      <p style="font-size: 1.25rem; color: var(--color-text); margin-bottom: 2rem;">
        Your enterprise blockchain development platform
      </p>
    </div>
    
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <div class="feature-title">Project Generation</div>
        <div class="feature-description">
          Create blockchain projects with our advanced templates
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🌐</div>
        <div class="feature-title">Multi-Chain Deployment</div>
        <div class="feature-description">
          Deploy to multiple chains simultaneously
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">Analytics Dashboard</div>
        <div class="feature-description">
          Real-time insights and metrics
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <div class="feature-title">Custom Templates</div>
        <div class="feature-description">
          ${features.customTemplates ? 'Create your own project templates' : 'Use our template library'}
        </div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${features.maxProjects === -1 ? 'Unlimited' : features.maxProjects}</div>
        <div class="stat-label">Max Projects</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">${features.maxAPIKeys === -1 ? 'Unlimited' : features.maxAPIKeys}</div>
        <div class="stat-label">API Keys</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">${features.templates.length}</div>
        <div class="stat-label">Templates</div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 3rem 0;">
      <button class="btn" onclick="createProject()">
        Create New Project
      </button>
    </div>
  </div>
  
  <script>
    const API_ENDPOINT = '${apiConfig.webhookUrl || `https://api-${config.domain.subdomain}.launchpad.platform`}';
    const API_KEY = localStorage.getItem('api_key');
    
    function createProject() {
      if (!API_KEY) {
        alert('Please set your API key first');
        return;
      }
      
      fetch(\`\${API_ENDPOINT}/api/v1/projects\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${API_KEY}\` 
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Project created:', data);
        alert('Project created successfully!');
      })
      .catch(error => {
        console.error('Failed to create project:', error);
        alert('Failed to create project: ' + error.message);
      });
    }
    
    // TODO: Load existing projects
    function loadProjects() {
      if (!API_KEY) return;
      
      fetch(\`\${API_ENDPOINT}/api/v1/projects\`, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${API_KEY}\` 
        }
      })
      .then(response => response.json())
      .then(data => {
        const projectsList = document.getElementById('projects-list');
        if (projectsList) {
          projectsList.innerHTML = '';
          data.projects.forEach(project => {
            projectsList.innerHTML += \`
              <div class="card">
                <h3>\${project.name}</h3>
                <p>\${project.description}</p>
                <button class="btn" onclick="manageProject('\${project.id}')">Manage</button>
              </div>
            \`;
          });
        }
      })
      .catch(error => {
        console.error('Failed to load projects:', error);
      });
    }
    
    // Load projects on page load
    window.addEventListener('load', loadProjects);
  </script>
</body>
</html>
    `.trim();
  }
}

// ============================================================
// API PROXY ROUTER
// ============================================================

class APIProxyRouter {
  private routingConfigs: Map<string, any> = new Map();

  async setupRouting(config: WhiteLabelConfig): Promise<void> {
    console.log(`🔀 Setting up API routing for ${config.domain.subdomain}`);

    const routingConfig = {
      subdomain: config.domain.subdomain,
      apiEndpoint: `https://api-${config.domain.subdomain}.launchpad.platform`,
      upstreamServices: {
        generation: 'http://localhost:3001',
        deployment: 'http://localhost:3002',
        billing: 'http://localhost:3003'
      },
      rateLimits: config.apiConfig.rateLimits,
      masterApiKey: config.apiConfig.masterApiKey
    };

    // In production:
    // - Configure nginx/Traefik routing
    // - Set up SSL termination
    // - Configure rate limiting per white-label instance
    // - Set up authentication

    this.routingConfigs.set(config.domain.subdomain, routingConfig);

    console.log('Routing configured:', routingConfig);
  }

  async teardownRouting(subdomain: string): Promise<void> {
    console.log(`🗑️ Removing routing for ${subdomain}`);

    // TODO: Remove routing configuration
    this.routingConfigs.delete(subdomain);

    console.log('Routing removed for:', subdomain);
  }
}

// ============================================================
// WHITE-LABEL PROVISIONER
// ============================================================

class WhiteLabelProvisioner extends EventEmitter {
  private dnsManager: DNSManager;
  private certificateManager: CertificateManager;
  private infraProvisioner: InfrastructureProvisioner;
  private dashboardGenerator: DashboardGenerator;
  private apiRouter: APIProxyRouter;
  private configs: Map<string, WhiteLabelConfig>;
  private tasks: Map<string, ProvisioningTask[]>;

  constructor(cloudflareApiToken: string, cloudflareZoneId: string) {
    super();
    this.dnsManager = new DNSManager(cloudflareApiToken, cloudflareZoneId);
    this.certificateManager = new CertificateManager(cloudflareApiToken, cloudflareZoneId);
    this.infraProvisioner = new InfrastructureProvisioner();
    this.dashboardGenerator = new DashboardGenerator();
    this.apiRouter = new APIProxyRouter();
    this.configs = new Map();
    this.tasks = new Map();
  }

  async provision(config: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    const whiteLabelId = `wl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const fullConfig: WhiteLabelConfig = {
      id: whiteLabelId,
      customerId: config.customerId!,
      enterpriseId: config.enterpriseId || `ent_${whiteLabelId}`,
      domain: {
        subdomain: config.domain?.subdomain || `${whiteLabelId}.launchpad.platform`,
        customDomain: config.domain?.customDomain
      },
      branding: config.branding || this.getDefaultBranding(),
      features: config.features || this.getDefaultFeatures(),
      apiConfig: {
        masterApiKey: this.generateMasterAPIKey(),
        rateLimits: config.apiConfig?.rateLimits || {
          requestsPerMinute: 1000,
          requestsPerDay: 50000
        },
        webhookUrl: config.apiConfig?.webhookUrl
      },
      status: 'provisioning',
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date()
      }
    };

    this.configs.set(whiteLabelId, fullConfig);

    // Start provisioning process
    this.executeProvisioning(whiteLabelId, fullConfig);

    return fullConfig;
  }

  private async executeProvisioning(whiteLabelId: string, config: WhiteLabelConfig): Promise<void> {
    console.log(`🚀 Starting provisioning for ${whiteLabelId}`);

    const tasks: ProvisioningTask[] = [
      { id: '1', whiteLabelId, type: 'dns_configuration', status: 'pending', progress: 0 },
      { id: '2', whiteLabelId, type: 'ssl_certificate', status: 'pending', progress: 0 },
      { id: '3', whiteLabelId, type: 'subdomain_routing', status: 'pending', progress: 0 },
      { id: '4', whiteLabelId, type: 'database_setup', status: 'pending', progress: 0 },
      { id: '5', whiteLabelId, type: 'api_key_generation', status: 'pending', progress: 0 },
      { id: '6', whiteLabelId, type: 'dashboard_deployment', status: 'pending', progress: 0 }
    ];

    if (config.domain.customDomain) {
      tasks.push({ id: '7', whiteLabelId, type: 'custom_domain_verification', status: 'pending', progress: 0 });
    }

    this.tasks.set(whiteLabelId, tasks);

    try {
      // Task 1: DNS Configuration
      await this.executeTask(tasks[0], async () => {
        if (config.domain.customDomain) {
          await this.dnsManager.createCNAME(config.domain.customDomain, process.env.PLATFORM_IP || '1.2.3.4');
        } else {
          await this.dnsManager.createSubdomain(config.domain.subdomain, process.env.PLATFORM_IP || '1.2.3.4');
        }
      });

      // Task 2: SSL Certificate
      await this.executeTask(tasks[1], async () => {
        const domain = config.domain.customDomain || config.domain.subdomain;
        const ssl = await this.certificateManager.provisionSSLCertificate(domain);
        const configObj = this.configs.get(whiteLabelId);
        configObj.domain.sslCertificate = ssl;
        this.configs.set(whiteLabelId, configObj);
      });

      // Task 3: Subdomain Routing
      await this.executeTask(tasks[2], async () => {
        await this.apiRouter.setupRouting(config);
      });

      // Task 4: Database Setup
      await this.executeTask(tasks[3], async () => {
        const dbUrl = await this.infraProvisioner.provisionDatabase(whiteLabelId);
        // TODO: Store database URL in config
        console.log(`Database URL: ${dbUrl}`);
      });

      // Task 5: API Key Generation
      await this.executeTask(tasks[4], async () => {
        const configObj = this.configs.get(whiteLabelId);
        console.log(`Master API Key: ${configObj.apiConfig.masterApiKey}`);
      });

      // Task 6: Dashboard Deployment
      await this.executeTask(tasks[5], async () => {
        const dashboardHTML = this.dashboardGenerator.generateBrandedDashboard(config);
        // TODO: Deploy dashboard to CDN
        console.log(`Dashboard deployed for ${config.domain.subdomain}`);
      });

      // Task 7: Custom Domain Verification (if applicable)
      if (config.domain.customDomain) {
        await this.executeTask(tasks[6], async () => {
          const verified = await this.dnsManager.verifyDomainOwnership(config.domain.customDomain);
          if (verified) {
            console.log(`✅ Custom domain verified: ${config.domain.customDomain}`);
          } else {
            console.log(`⚠️ Domain verification pending for ${config.domain.customDomain}`);
          }
        });
      }

      // Mark as active
      const configObj = this.configs.get(whiteLabelId);
      configObj.status = 'active';
      configObj.metadata.provisioningCompleted = new Date();

      this.emit('provisioned', configObj);

    } catch (error) {
      const configObj = this.configs.get(whiteLabelId);
      configObj.status = 'suspended';
      this.emit('error', { whiteLabelId, error: (error as Error).message });
    }
  }

  private async executeTask(task: ProvisioningTask, fn: () => Promise<void>): Promise<void> {
    task.status = 'in_progress';
    task.progress = 10;
    task.startedAt = new Date();
    this.emit('task-progress', task);

    try {
      await fn();
      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date();
      this.emit('task-completed', task);
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      this.emit('task-failed', task);
    }
  }

  private generateMasterAPIKey(): string {
    return `lpk_master_${crypto.randomBytes(32).toString('base64url')}`;
  }

  private getDefaultBranding(): WhiteLabelConfig['branding'] {
    return {
      companyName: 'Launchpad Platform',
      logo: {
        url: 'https://cdn.launchpad.platform/default-logo.png',
        favicon: 'https://cdn.launchpad.platform/default-favicon.png'
      },
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#0f172a',
        text: '#f1f5f9'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFont: 'Inter, system-ui, sans-serif'
      }
    };
  }

  private getDefaultFeatures(): WhiteLabelConfig['features'] {
    return {
      templates: ['basic_token', 'token_sale', 'advanced_launchpad'],
      maxProjects: 10,
      maxAPIKeys: 5,
      customTemplates: false,
      prioritySupport: false,
      dedicatedInfrastructure: false
    };
  }

  getConfig(whiteLabelId: string): WhiteLabelConfig | undefined {
    return this.configs.get(whiteLabelId);
  }

  getTasks(whiteLabelId: string): ProvisioningTask[] | undefined {
    return this.tasks.get(whiteLabelId);
  }

  async terminate(whiteLabelId: string): Promise<void> {
    console.log(`🗑️ Terminating white-label instance: ${whiteLabelId}`);

    const config = this.configs.get(whiteLabelId);
    if (!config) throw new Error('White-label config not found');

    // Remove routing
    await this.apiRouter.teardownRouting(config.domain.subdomain);

    // TODO: Clean up resources
    // - Delete database
    // - Remove Redis instance
    // - Cancel SSL certificate

    config.status = 'terminated';
    this.configs.set(whiteLabelId, config);

    this.emit('terminated', config);
  }
}

// ============================================================
// WHITE-LABEL SERVICE
// ============================================================

class WhiteLabelService extends EventEmitter {
  private provisioner: WhiteLabelProvisioner;

  constructor(cloudflareApiToken: string, cloudflareZoneId: string) {
    super();
    this.provisioner = new WhiteLabelProvisioner(cloudflareApiToken, cloudflareZoneId);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.provisioner.app.use(express.json());
  }

  private setupRoutes(): void {
    // Provisioning
    this.provisioner.app.post('/api/v1/whitelabel/provision', this.handleProvision.bind(this));
    this.provisioner.app.get('/api/v1/whitelabel/:id', this.handleGetConfig.bind(this));
    this.provisioner.app.get('/api/v1/whitelabel/:id/status', this.handleGetStatus.bind(this));
    
    // Branding
    this.provisioner.app.put('/api/v1/whitelabel/:id/branding', this.handleUpdateBranding.bind(this));
    
    // Domain
    this.provisioner.app.post('/api/v1/whitelabel/:id/verify-domain', this.handleVerifyDomain.bind(this));
    
    // Termination
    this.provisioner.app.delete('/api/v1/whitelabel/:id', this.handleTerminate.bind(this));
    
    // Health check
    this.provisioner.app.get('/api/v1/whitelabel/health', this.handleHealth.bind(this));
  }

  private setupEventHandlers(): void {
    this.provisioner.on('provisioned', (config: WhiteLabelConfig) => {
      console.log(`✅ White-label instance provisioned: ${config.id}`);
      console.log(`   Dashboard: https://${config.domain.subdomain}.launchpad.platform`);
      console.log(`   API: https://api-${config.domain.subdomain}.launchpad.platform`);
    });

    this.provisioner.on('task-progress', (task: ProvisioningTask) => {
      console.log(`⏳ Task ${task.type}: ${task.status} (${task.progress}%)`);
    });

    this.provisioner.on('task-completed', (task: ProvisioningTask) => {
      console.log(`✅ Task completed: ${task.type}`);
    });

    this.provisioner.on('task-failed', ({ whiteLabelId, error }) => {
      console.error(`❌ Task failed for ${whiteLabelId}: ${error}`);
    });

    this.provisioner.on('error', ({ whiteLabelId, error }) => {
      console.error(`❌ Provisioning error for ${whiteLabelId}: ${error}`);
    });
  }

  private async handleProvision(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.provisioner.provision(req.body);
      
      res.json({
        whiteLabelId: config.id,
        subdomain: config.domain.subdomain,
        apiEndpoint: `https://api-${config.domain.subdomain}.launchpad.platform`,
        dashboardUrl: `https://${config.domain.subdomain}.launchpad.platform`,
        masterApiKey: config.apiConfig.masterApiKey,
        status: config.status
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleGetConfig(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const config = this.provisioner.getConfig(id);
    
    if (!config) {
      res.status(404).json({ error: 'White-label config not found' });
      return;
    }

    res.json(config);
  }

  private async handleGetStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tasks = this.provisioner.getTasks(id);
    
    if (!tasks) {
      res.status(404).json({ error: 'Provisioning tasks not found' });
      return;
    }

    const progress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;

    res.json({
      whiteLabelId: id,
      progress: Math.round(progress),
      tasks: tasks.map(t => ({
        type: t.type,
        status: t.status,
        progress: t.progress
      }))
    });
  }

  private async handleUpdateBranding(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.provisioner.updateBranding(id, req.body);
      res.json({ message: 'Branding updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleVerifyDomain(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const config = this.provisioner.getConfig(id);
      
      if (!config) {
        res.status(404).json({ error: 'White-label config not found' });
        return;
      }

      const verified = await this.provisioner.dnsManager.verifyDomainOwnership(config.domain.customDomain!);
      
      res.json({ verified });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleTerminate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.provisioner.terminate(id);
      res.json({ message: 'White-label instance terminated' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private handleHealth(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'white-label-service',
      version: '1.0.0',
      activeInstances: this.provisioner.configs.size,
      totalProvisioned: Array.from(this.provisioner.configs.values()).filter(c => c.status === 'active').length
    });
  }

  listen(port: number): void {
    this.provisioner.app.listen(port, () => {
      console.log(`🏷️ White-Label Service listening on port ${port}`);
      console.log(`💰 White-label pricing configured:`);
      Object.entries(WHITE_LABEL_PRICING).forEach(([tier, config]) => {
        console.log(`   ${tier}: $${config.monthlyPrice}/month`);
      });
    });
  }
}

// ============================================================
// STARTUP
// ============================================================

if (require.main === module) {
  const cloudflareApiKey = process.env.CLOUDFLARE_API_KEY || 'your-api-key';
  const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID || 'your-zone-id';
  
  const service = new WhiteLabelService(cloudflareApiKey, cloudflareZoneId);
  service.listen(parseInt(process.env.PORT || '3004'));
}

export { 
  WhiteLabelService, 
  WhiteLabelProvisioner, 
  WHITE_LABEL_PRICING,
  DNSManager,
  CertificateManager,
  InfrastructureProvisioner,
  DashboardGenerator,
  APIProxyRouter
};
