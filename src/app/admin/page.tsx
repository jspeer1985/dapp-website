'use client';

import { useEffect, useState } from 'react';

interface Job {
  generationId: string;
  projectName: string;
  projectType: string;
  tier: string;
  status: string;
  paymentAmount: number;
  paymentStatus: string;
  riskScore: number;
  whitelistStatus: string;
  createdAt: string;
  completedAt?: string;
  walletAddress: string;
  customerEmail?: string;
  customerName?: string;
  downloadToken?: string;
  downloadCount?: number;
  maxDownloads?: number;
  canDownload?: boolean;
  expiresAt?: string;
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  refunded: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    refunded: 0,
    totalRevenue: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs');
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
        setStats(data.stats);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'pending') return job.status === 'pending_payment';
    if (filter === 'processing') return ['payment_confirmed', 'generating', 'review_required', 'approved', 'deploying'].includes(job.status);
    return job.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending_payment': return 'bg-yellow-500/20 text-yellow-400';
      case 'payment_confirmed':
      case 'generating':
      case 'approved':
      case 'deploying': return 'bg-blue-500/20 text-blue-400';
      case 'review_required': return 'bg-orange-500/20 text-orange-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'refunded': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">dApp Factory Admin Dashboard</h1>
          <p className="text-gray-400">Monitor all generation jobs and payments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Total Jobs</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-yellow-400 text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-sm mb-2">Processing</div>
            <div className="text-3xl font-bold text-blue-400">{stats.processing}</div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="text-red-400 text-sm mb-2">Failed</div>
            <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm mb-2">Revenue (SOL)</div>
            <div className="text-3xl font-bold text-purple-400">
              {stats.totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {['all', 'pending', 'processing', 'completed', 'failed', 'refunded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-bold">Generation ID</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Project</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Customer</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Type</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Tier</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Amount (SOL)</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Status</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Risk</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Downloads</th>
                  <th className="text-left p-4 text-gray-400 font-bold">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.generationId} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                        {job.generationId.slice(0, 10)}...
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-bold">{job.projectName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-bold">{job.customerName || 'N/A'}</div>
                      <div className="text-gray-400 text-sm">{job.customerEmail || 'No email'}</div>
                    </td>
                    <td className="p-4 text-gray-300 capitalize">
                      {job.projectType}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-300 capitalize">
                        {job.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-bold">
                        {job.paymentAmount?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(job.status)}`}>
                        {formatStatus(job.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${
                        job.riskScore > 50 ? 'text-red-400' :
                        job.riskScore > 30 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {job.riskScore}/100
                      </span>
                    </td>
                    <td className="p-4">
                      {job.downloadToken ? (
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            job.canDownload 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {job.downloadCount || 0}/{job.maxDownloads || 10}
                          </span>
                          {job.canDownload && (
                            <a 
                              href={`/api/downloads/${job.downloadToken}`}
                              target="_blank"
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No jobs found for this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
