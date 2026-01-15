// app/track/[jobId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  estimatedCompletion: string;
  completedAt?: string;
  productType: string;
  totalPrice: number;
  progressPercentage?: number;
  currentPhase?: string;
  downloadUrl?: string;
  fileSizeMB?: string;
  error?: string;
}

export default function TrackOrderPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/check-status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        
        const data = await response.json();
        setJobStatus(data);
        setLoading(false);
        
        // Poll every 10 seconds if still processing
        if (data.status === 'processing') {
          setTimeout(fetchStatus, 10000);
        }
        
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, [jobId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading order status...</p>
        </div>
      </div>
    );
  }
  
  if (error || !jobStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-gray-300 mb-8">
            We couldn't find an order with ID: <code className="font-mono bg-black/30 px-2 py-1 rounded">{jobId}</code>
          </p>
          
            <a
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
  
  const phases = [
    'Planning & Architecture',
    'Smart Contract Development',
    'Frontend Development',
    'Marketing Content',
    'Financial Analysis',
    'Security Audit',
    'Quality Assurance',
    'Documentation',
    'Final Packaging',
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Order Tracking</h1>
          <p className="text-xl text-gray-300">Job ID: {jobId}</p>
        </motion.div>
        
        {/* Status Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8"
        >
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-gray-400 mb-2">Status</div>
              <div className="flex items-center gap-3">
                {jobStatus.status === 'processing' && (
                  <>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-2xl font-bold text-blue-400">Processing</span>
                  </>
                )}
                {jobStatus.status === 'completed' && (
                  <>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-2xl font-bold text-green-400">Completed</span>
                  </>
                )}
                {jobStatus.status === 'failed' && (
                  <>
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-2xl font-bold text-red-400">Failed</span>
                  </>
                )}
                {jobStatus.status === 'pending' && (
                  <>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-2xl font-bold text-yellow-400">Pending</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-gray-400 mb-2">Product</div>
              <div className="text-xl font-bold text-white capitalize">
                {jobStatus.productType.replace('-', ' ')}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {jobStatus.status === 'processing' && jobStatus.progressPercentage !== undefined && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">Progress</span>
                <span className="text-blue-400 font-bold">{jobStatus.progressPercentage}%</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${jobStatus.progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
              {jobStatus.currentPhase && (
                <p className="text-gray-300 mt-2">
                  Current phase: <strong className="text-white">{jobStatus.currentPhase}</strong>
                </p>
              )}
            </div>
          )}
          
          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black/20 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Created</div>
              <div className="text-white font-bold">
                {new Date(jobStatus.createdAt).toLocaleString()}
              </div>
            </div>
            
            {jobStatus.status === 'completed' && jobStatus.completedAt ? (
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Completed</div>
                <div className="text-green-400 font-bold">
                  {new Date(jobStatus.completedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Estimated Completion</div>
                <div className="text-yellow-400 font-bold">
                  {new Date(jobStatus.estimatedCompletion).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          {/* Download Button */}
          {jobStatus.status === 'completed' && jobStatus.downloadUrl && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">Your DApp is Ready!</h2>
              <p className="text-white/90 mb-6">
                File size: {jobStatus.fileSizeMB} MB
              </p>
              
                <a
                href={jobStatus.downloadUrl}
                className="inline-block bg-white text-blue-600 px-12 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                📦 Download Your Project
              </a>
            </motion.div>
          )}
          
          {/* Error Message */}
          {jobStatus.status === 'failed' && jobStatus.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-red-400 font-bold mb-2">Error Details:</h3>
              <p className="text-gray-300">{jobStatus.error}</p>
              <p className="text-gray-400 text-sm mt-4">
                Please contact support at support@optikecosystem.com with your Job ID.
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Phase Checklist (for processing status) */}
        {jobStatus.status === 'processing' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Production Pipeline</h2>
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const isActive = jobStatus.currentPhase === phase;
                const isCompleted = phases.indexOf(jobStatus.currentPhase || '') > index;
                
                return (
                  <div
                    key={phase}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isActive ? 'bg-blue-500/20 border-2 border-blue-500' :
                      isCompleted ? 'bg-green-500/10 border-2 border-green-500/30' :
                      'bg-white/5 border-2 border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-500 text-white' :
                      'bg-white/20 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${
                        isActive ? 'text-blue-400' :
                        isCompleted ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {phase}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}