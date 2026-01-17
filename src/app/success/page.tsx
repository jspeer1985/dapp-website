'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, CheckCircle2, Package, Shield } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get('id');
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier');
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStripeSuccess, setIsStripeSuccess] = useState(false);

  useEffect(() => {
    // Check if this is a Stripe success
    if (sessionId && tier) {
      setIsStripeSuccess(true);
      setLoading(false);
      return;
    }

    // Otherwise, handle generation success
    if (!generationId) {
      setLoading(false);
      return;
    }

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
  }, [generationId, sessionId, tier]);

  if (loading) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Stripe Checkout Success
  if (isStripeSuccess) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="mb-3 text-4xl font-bold">🎉 Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Premium'} tier
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check your email for your API key and getting started instructions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Your account has been upgraded and is ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">API Access</p>
                    <p className="text-lg font-bold">{tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Premium'} Tier</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Shield className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Getting Started:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Check your email for your API key</li>
                  <li>Review the documentation for your tier</li>
                  <li>Start building your first project</li>
                  <li>Join our Discord community for support</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <a href="/docs">
                    View Documentation
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={tier ? `/factory?tier=${tier}` : '/factory'}>
                    Start Building
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (generation.downloadToken) {
      window.location.href = `/api/downloads/${generation.downloadToken}`;
    }
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-3 text-4xl font-bold">🎉 Generation Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Your dApp is ready to download and deploy
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{generation.projectName}</CardTitle>
            <CardDescription>Generated successfully with AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Project Type</p>
                  <p className="text-lg font-bold capitalize">{generation.projectType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Risk Score</p>
                  <p className="text-lg font-bold">{generation.compliance.riskScore}/100</p>
                </div>
              </div>
            </div>

            {generation.downloadInfo?.canDownload && generation.downloadToken ? (
              <div className="space-y-4">
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5" />
                  Download Project Files
                </Button>

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="mb-2 font-medium">Download Information:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Downloads remaining: {generation.downloadInfo.downloadsRemaining}</li>
                    <li>
                      • Expires: {new Date(generation.downloadInfo.expiresAt).toLocaleDateString()}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Download limit reached or link expired
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Extract the downloaded ZIP file</li>
                <li>Run <code className="rounded bg-muted px-1 py-0.5">npm install</code> to install dependencies</li>
                <li>Configure environment variables in <code className="rounded bg-muted px-1 py-0.5">.env.local</code></li>
                <li>Run <code className="rounded bg-muted px-1 py-0.5">npm run dev</code> to start development</li>
                <li>Deploy to Vercel or your preferred hosting platform</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/launch?id=${generationId}`}>
                  View Details
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href="/factory">
                  Create Another
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthGuard requireAuth={true}>
        <SuccessPageContent />
      </AuthGuard>
    </Suspense>
  );
}
