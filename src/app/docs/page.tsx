'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code, 
  Shield, 
  Zap, 
  Brain, 
  Settings,
  ArrowRight,
  FileText,
  Package
} from 'lucide-react';

export default function DocsPage() {
  const documentationSections = [
    {
      title: 'Architecture',
      description: 'Technical specifications and system design',
      icon: Package,
      color: 'bg-blue-500',
      pages: [
        {
          title: 'Living dApp Specification',
          description: 'Complete technical architecture for autonomous blockchain applications',
          href: '/docs/architecture/living-dapp-spec',
          badge: 'Featured',
          featured: true
        }
      ]
    },
    {
      title: 'Development',
      description: 'Guides and tutorials for building dApps',
      icon: Code,
      color: 'bg-green-500',
      pages: [
        {
          title: 'Getting Started',
          description: 'Quick start guide for dApp development',
          href: '/docs/getting-started',
          badge: 'Popular',
          featured: false
        },
        {
          title: 'API Reference',
          description: 'Complete API documentation',
          href: '/docs/api',
          badge: 'Technical',
          featured: false
        }
      ]
    },
    {
      title: 'Security',
      description: 'Security best practices and guidelines',
      icon: Shield,
      color: 'bg-red-500',
      pages: [
        {
          title: 'Security Guidelines',
          description: 'Essential security practices for dApps',
          href: '/docs/security',
          badge: 'Important',
          featured: false
        },
        {
          title: 'Audit Process',
          description: 'Security audit procedures and checklists',
          href: '/docs/security/audit',
          badge: 'Required',
          featured: false
        }
      ]
    },
    {
      title: 'Features',
      description: 'Feature documentation and implementation guides',
      icon: Zap,
      color: 'bg-purple-500',
      pages: [
        {
          title: 'Living dApp Features',
          description: 'Autonomous optimization and self-healing capabilities',
          href: '/docs/features/living-dapp',
          badge: 'New',
          featured: false
        },
        {
          title: 'Token Integration',
          description: 'Solana token creation and management',
          href: '/docs/features/tokens',
          badge: 'Guide',
          featured: false
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Living dApp Spec', href: '/docs/architecture/living-dapp-spec', icon: Brain },
    { title: 'Create dApp', href: '/factory', icon: Zap },
    { title: 'Templates', href: '/templates', icon: Code },
    { title: 'API Reference', href: '/docs/api', icon: FileText }
  ];

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-sm">
            Documentation
          </Badge>
          <h1 className="text-4xl font-bold">Optik Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guides, API references, and technical specifications for building autonomous blockchain applications
          </p>
        </div>

        {/* Quick Links */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Button
                  key={link.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  asChild
                >
                  <a href={link.href}>
                    <link.icon className="w-6 h-6" />
                    <span className="text-sm">{link.title}</span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {documentationSections.map((section) => (
            <Card key={section.title} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${section.color} rounded-full flex items-center justify-center`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.pages.map((page) => (
                  <div
                    key={page.href}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      page.featured ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{page.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {page.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {page.description}
                        </p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                          <a href={page.href} className="flex items-center gap-1">
                            Read more
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Getting Started Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">New to Optik?</h3>
                <p className="text-muted-foreground mb-6">
                  Start building autonomous blockchain applications in minutes. Our comprehensive documentation 
                  and intuitive tools make it easy to create, deploy, and manage Living dApps.
                </p>
                <div className="flex gap-4">
                  <Button size="lg" asChild>
                    <a href="/factory">Create Your First dApp</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/docs/architecture/living-dapp-spec">Read the Spec</a>
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Comprehensive Docs</h4>
                    <p className="text-sm text-muted-foreground">Everything you need to succeed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Quick Start</h4>
                    <p className="text-sm text-muted-foreground">Build in minutes, not hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI-Powered</h4>
                    <p className="text-sm text-muted-foreground">Autonomous optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>
              Helpful links and resources for developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-slate-600" />
                </div>
                <h4 className="font-semibold mb-2">Developer Tools</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  CLI tools, SDKs, and development utilities
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/tools">Explore Tools</a>
                </Button>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-slate-600" />
                </div>
                <h4 className="font-semibold mb-2">Security Center</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Security best practices and audit guidelines
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/security">Security Docs</a>
                </Button>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <h4 className="font-semibold mb-2">Examples</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Code examples and implementation guides
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/examples">View Examples</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
