'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Plus,
  Settings,
  CreditCard,
  FileText,
  Eye,
  Download,
  ExternalLink,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: 'dapp' | 'token' | 'both';
  status: 'active' | 'building' | 'completed' | 'failed';
  createdAt: string;
  lastModified: string;
  tier: string;
  description: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalSpent: number;
  templatesPurchased: number;
  apiCalls: number;
  storageUsed: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 12,
    activeProjects: 3,
    totalSpent: 2847,
    templatesPurchased: 5,
    apiCalls: 45678,
    storageUsed: 67
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'DeFi Yield Farm',
      type: 'dapp',
      status: 'active',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      tier: 'Professional',
      description: 'Multi-pool yield farming protocol'
    },
    {
      id: '2',
      name: 'NFT Marketplace',
      type: 'both',
      status: 'building',
      createdAt: '2024-01-10',
      lastModified: '2024-01-18',
      tier: 'Builder',
      description: 'Complete NFT marketplace with auctions'
    },
    {
      id: '3',
      name: 'Token Launch',
      type: 'token',
      status: 'completed',
      createdAt: '2024-01-05',
      lastModified: '2024-01-08',
      tier: 'Starter',
      description: 'ERC20 token with presale mechanism'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'building': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'building': return <Clock className="h-4 w-4" />;
      case 'completed': return <Shield className="h-4 w-4" />;
      case 'failed': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's an overview of your dApp Factory activity.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalSpent}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Templates Purchased</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.templatesPurchased}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Download className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Create New Project</h3>
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-blue-100 mb-4">
                  Start building your next dApp or token
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/factory'}
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Browse Templates</h3>
                  <Eye className="h-6 w-6" />
                </div>
                <p className="text-purple-100 mb-4">
                  Explore our collection of professional templates
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/templates'}
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Upgrade Plan</h3>
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-green-100 mb-4">
                  Unlock more features and increase your limits
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Projects</CardTitle>
                  <CardDescription>
                    Your latest dApp Factory projects and their status
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/projects'}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(project.status)}
                            <span className="text-xs capitalize">{project.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Tier: {project.tier}</span>
                        <span>Created: {project.createdAt}</span>
                        <span>Modified: {project.lastModified}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Launch
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
