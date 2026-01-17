'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

function LaunchPageContent() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get('id');
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!generationId) return;

    const fetchGeneration = async () => {
      try {
        const response = await fetch(`/api/generations/${generationId}`);
        const data = await response.json();
        if (data.success) {
          setGeneration(data.generation);
        }
      } catch (error) {
        console.error('Error fetching generation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneration();
    const interval = setInterval(fetchGeneration, 3000);
    return () => clearInterval(interval);
  }, [generationId]);

  if (loading) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Progress value={undefined} className="mb-4" />
          <p className="text-muted-foreground">Loading generation status...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground">Generation not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending_payment: { variant: 'warning', icon: Clock },
      payment_confirmed: { variant: 'default', icon: CheckCircle2 },
      generating: { variant: 'default', icon: Clock },
      review_required: { variant: 'warning', icon: AlertTriangle },
      approved: { variant: 'success', icon: CheckCircle2 },
      completed: { variant: 'success', icon: CheckCircle2 },
      failed: { variant: 'destructive', icon: AlertTriangle },
    };

    const config = variants[status] || { variant: 'default', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold">Launch Status</h1>
          <p className="text-lg text-muted-foreground">
            Track your dApp generation and deployment
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{generation.projectName}</CardTitle>
                <CardDescription>Generation ID: {generation.generationId}</CardDescription>
              </div>
              {getStatusBadge(generation.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Payment Confirmation</span>
                  {generation.payment.status === 'confirmed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Code Generation</span>
                  {['generating', 'review_required', 'approved', 'completed'].includes(generation.status) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Security Review</span>
                  {['approved', 'completed'].includes(generation.status) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : generation.status === 'review_required' ? (
                    <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Ready for Download</span>
                  {generation.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {generation.compliance && (
              <div>
                <h3 className="mb-3 font-semibold">Security Analysis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Score</span>
                    <span className="font-bold">{generation.compliance.riskScore}/100</span>
                  </div>
                  <Progress value={100 - generation.compliance.riskScore} />
                  <p className="text-xs text-muted-foreground">
                    Lower is better. Your project has been analyzed for security vulnerabilities.
                  </p>
                </div>
              </div>
            )}

            {generation.status === 'completed' && generation.downloadInfo?.canDownload && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p className="mb-3 font-semibold">Your dApp is ready!</p>
                <a href={`/success?id=${generationId}`} className="text-primary hover:underline">
                  Go to Success Page →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthGuard requireAuth={true}>
        <LaunchPageContent />
      </AuthGuard>
    </Suspense>
  );
}
