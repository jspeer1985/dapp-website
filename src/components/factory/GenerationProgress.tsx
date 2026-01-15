'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GenerationProgressProps {
  generationId: string;
}

export default function GenerationProgress({ generationId }: GenerationProgressProps) {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/generations/${generationId}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data.generation);

          const statusProgress: Record<string, number> = {
            pending_payment: 10,
            payment_confirmed: 30,
            generating: 60,
            review_required: 80,
            approved: 90,
            completed: 100,
            failed: 0,
          };

          setProgress(statusProgress[data.generation.status] || 0);

          if (data.generation.status === 'completed') {
            setTimeout(() => {
              router.push(`/success?id=${generationId}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [generationId, router]);

  const getStatusIcon = () => {
    if (!status) return <Loader2 className="h-8 w-8 animate-spin text-primary" />;

    if (status.status === 'completed') {
      return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    }

    if (status.status === 'failed') {
      return <AlertCircle className="h-8 w-8 text-red-500" />;
    }

    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  };

  const getStatusMessage = () => {
    if (!status) return 'Loading...';

    const messages: Record<string, string> = {
      payment_confirmed: 'Payment confirmed, preparing generation...',
      generating: 'AI is generating your dApp code...',
      review_required: 'Code generated, undergoing security review...',
      approved: 'Security review passed, packaging files...',
      completed: 'Generation complete! Redirecting...',
      failed: 'Generation failed. Please contact support.',
    };

    return messages[status.status] || 'Processing...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation in Progress</CardTitle>
        <CardDescription>
          This may take 2-5 minutes depending on project complexity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          {getStatusIcon()}
          <div className="text-center">
            <p className="font-medium">{getStatusMessage()}</p>
            {status && (
              <Badge variant="outline" className="mt-2">
                {status.status.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {status?.compliance && status.compliance.riskScore > 0 && (
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-2">Security Analysis:</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risk Score</span>
              <Badge variant={status.compliance.riskScore > 50 ? 'warning' : 'success'}>
                {status.compliance.riskScore}/100
              </Badge>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Please do not close this page while generation is in progress.
        </p>
      </CardContent>
    </Card>
  );
}
