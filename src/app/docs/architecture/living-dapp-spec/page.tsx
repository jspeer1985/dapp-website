'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Cpu, 
  Shield, 
  Zap, 
  Network, 
  BarChart3, 
  Settings, 
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function LivingDappSpecPage() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('overview');

  const coreComponents = [
    {
      id: 'monitoring',
      title: 'Monitoring Layer',
      icon: Network,
      description: 'The nervous system - continuous real-time observation',
      color: 'bg-blue-500',
      features: ['Blockchain Monitor', 'User Behavior Monitor', 'Security Monitor', 'Performance Monitor']
    },
    {
      id: 'analysis',
      title: 'Analysis Engine',
      icon: Brain,
      description: 'The brain\'s processing layer - AI-powered insights',
      color: 'bg-purple-500',
      features: ['Health Metrics Analysis', 'Pattern Recognition', 'Predictive Analytics', 'Competitive Analysis']
    },
    {
      id: 'decision',
      title: 'Decision Engine',
      icon: Cpu,
      description: 'The strategic brain - intelligent decision making',
      color: 'bg-green-500',
      features: ['Action Prioritization', 'Risk Assessment', 'Automation Levels', 'Execution Planning']
    },
    {
      id: 'execution',
      title: 'Execution Engine',
      icon: Zap,
      description: 'The hands - autonomous implementation',
      color: 'bg-orange-500',
      features: ['Code Generation', 'Infrastructure Management', 'UX Optimization', 'Automated Testing']
    },
    {
      id: 'learning',
      title: 'Learning Engine',
      icon: Lightbulb,
      description: 'The memory - continuous improvement',
      color: 'bg-pink-500',
      features: ['Outcome Analysis', 'Pattern Learning', 'Model Updates', 'Community Knowledge']
    }
  ];

  const workflowSteps = [
    {
      phase: 'MONITORING',
      description: 'Continuous observation of all dApp activity',
      icon: Network,
      status: 'active',
      details: ['Transaction spike detected', 'Gas costs increased 40%', 'User complaints about slow minting']
    },
    {
      phase: 'ANALYSIS',
      description: 'AI analyzes patterns and identifies optimization opportunities',
      icon: Brain,
      status: 'completed',
      details: ['Inefficient loop in contract detected', 'Could save 40% gas with optimization', 'Estimates $2,400/month savings']
    },
    {
      phase: 'DECISION',
      description: 'Risk assessment and automation level determination',
      icon: Cpu,
      status: 'completed',
      details: ['Risk assessment: LOW', 'ROI assessment: HIGH', 'Automation: AUTO_WITH_NOTIFICATION']
    },
    {
      phase: 'EXECUTION',
      description: 'Generate, test, and deploy optimized code',
      icon: Zap,
      status: 'in-progress',
      details: ['Generating optimized contract code', 'Deploying to devnet', 'Running 100 automated tests']
    },
    {
      phase: 'LEARNING',
      description: 'Record outcomes and improve future decisions',
      icon: Lightbulb,
      status: 'pending',
      details: ['Record: "Gas optimization successful"', 'Update success patterns', 'Share anonymized learning']
    }
  ];

  const safetyRules = [
    { category: 'Manual Approval Required', items: ['Smart Contract Logic Changes', 'Token Economics Changes', 'Access Control Modifications'], severity: 'high' },
    { category: 'Required Testing', items: ['Unit Tests', 'Integration Tests', 'Security Scan', 'Devnet Simulation'], severity: 'medium' },
    { category: 'Emergency Halt', items: ['Error Rate Spike >500%', 'Gas Spike >1000%', 'Critical Security Alert'], severity: 'critical' },
    { category: 'Auto Rollback', items: ['Any Test Failures', 'Production Errors >5%', 'Performance Regression >20%'], severity: 'high' }
  ];

  const renderArchitectureDiagram = () => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Living dApp Ecosystem</h3>
        <p className="text-slate-400">Autonomous, self-improving blockchain applications</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">User's dApp</h4>
            <p className="text-slate-400 text-sm">Your blockchain application</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">AI Brain</h4>
            <p className="text-slate-400 text-sm">Claude-powered intelligence</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Network className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Solana</h4>
            <p className="text-slate-400 text-sm">Blockchain infrastructure</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h4 className="text-white font-semibold mb-4 text-center">Living dApp Control Plane</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {coreComponents.map((component) => (
            <div
              key={component.id}
              className="text-center cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => setActiveComponent(component.id)}
            >
              <div className={`w-12 h-12 ${component.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <component.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-xs font-medium">{component.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWorkflow = () => (
    <div className="space-y-4">
      {workflowSteps.map((step, index) => (
        <Card key={step.phase} className="border-l-4 border-l-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{step.phase}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </div>
              <Badge variant={
                step.status === 'completed' ? 'default' :
                step.status === 'in-progress' ? 'secondary' :
                step.status === 'active' ? 'destructive' : 'outline'
              }>
                {step.status.replace('-', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {step.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <ArrowRight className="w-3 h-3" />
                  {detail}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSafetyRules = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {safetyRules.map((rule) => (
        <Card key={rule.category} className={
          rule.severity === 'critical' ? 'border-red-200 bg-red-50' :
          rule.severity === 'high' ? 'border-orange-200 bg-orange-50' :
          'border-slate-200'
        }>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {rule.category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rule.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-sm">
            Technical Architecture
          </Badge>
          <h1 className="text-4xl font-bold">Living dApp Specification</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Autonomous, self-improving blockchain applications that use AI to monitor, optimize, and evolve themselves without human intervention
          </p>
        </div>

        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
            <CardDescription>
              Complete ecosystem overview showing how components interact
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderArchitectureDiagram()}
          </CardContent>
        </Card>

        {/* Core Components */}
        <Card>
          <CardHeader>
            <CardTitle>Core Components</CardTitle>
            <CardDescription>
              The five layers that make up the Living dApp control plane
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreComponents.map((component) => (
                <Card 
                  key={component.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => setActiveComponent(activeComponent === component.id ? null : component.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${component.color} rounded-full flex items-center justify-center`}>
                        <component.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{component.title}</CardTitle>
                        <CardDescription>{component.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {activeComponent === component.id && (
                    <CardContent>
                      <ul className="space-y-2">
                        {component.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <Tabs value={expandedSection} onValueChange={setExpandedSection}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="safety">Safety Rules</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  A Living dApp represents the next evolution in blockchain applications - 
                  autonomous organisms that continuously monitor their own performance, 
                  identify optimization opportunities, and implement improvements without human intervention.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Self-Optimizing</h4>
                    <p className="text-sm text-muted-foreground">Continuously improves performance and reduces costs</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Self-Healing</h4>
                    <p className="text-sm text-muted-foreground">Automatically detects and fixes security issues</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Self-Learning</h4>
                    <p className="text-sm text-muted-foreground">Gets smarter from every optimization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle>Complete Optimization Cycle</CardTitle>
                <CardDescription>
                  How a Living dApp processes and implements improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderWorkflow()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety">
            <Card>
              <CardHeader>
                <CardTitle>Safety & Guardrails</CardTitle>
                <CardDescription>
                  Critical safety rules that prevent harmful autonomous actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSafetyRules()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Phases</CardTitle>
                <CardDescription>
                  Roadmap for building and deploying Living dApps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      phase: 'Phase 1: Foundation',
                      duration: 'Month 1-2',
                      status: 'completed',
                      features: ['Basic monitoring', 'Gas optimization', 'Manual approval workflow']
                    },
                    {
                      phase: 'Phase 2: Intelligence',
                      duration: 'Month 3-4',
                      status: 'in-progress',
                      features: ['AI analysis engine', 'Predictive analytics', 'Automated A/B testing']
                    },
                    {
                      phase: 'Phase 3: Autonomy',
                      duration: 'Month 5-6',
                      status: 'pending',
                      features: ['Automated code patching', 'Self-healing security', 'Full living organism']
                    },
                    {
                      phase: 'Phase 4: Ecosystem',
                      duration: 'Month 7-12',
                      status: 'planned',
                      features: ['Cross-dApp learning', 'Template marketplace', 'Enterprise features']
                    }
                  ].map((phase) => (
                    <Card key={phase.phase}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{phase.phase}</h4>
                            <p className="text-sm text-muted-foreground">{phase.duration}</p>
                          </div>
                          <Badge variant={
                            phase.status === 'completed' ? 'default' :
                            phase.status === 'in-progress' ? 'secondary' : 'outline'
                          }>
                            {phase.status}
                          </Badge>
                        </div>
                        <ul className="space-y-1">
                          {phase.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Build a Living dApp?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the future of autonomous blockchain applications. Start creating your own self-improving dApps today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/factory">Create Living dApp</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/templates">View Templates</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
