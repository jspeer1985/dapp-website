'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GenerationDetail from './GenerationDetail';
import { FileCode, Shield } from 'lucide-react';

interface ReviewQueueProps {
  reviews: any[];
  onUpdate: () => void;
  loading: boolean;
}

export default function ReviewQueue({ reviews, onUpdate, loading }: ReviewQueueProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading reviews...
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No pending reviews</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedId) {
    return (
      <GenerationDetail
        generationId={selectedId}
        onBack={() => {
          setSelectedId(null);
          onUpdate();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.generationId} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{review.projectName}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {review.projectDescription}
                </CardDescription>
              </div>
              <Badge
                variant={review.riskScore > 70 ? 'destructive' : review.riskScore > 40 ? 'warning' : 'default'}
              >
                Risk: {review.riskScore}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>ID: {review.generationId}</p>
                <p>Wallet: {review.walletAddress.slice(0, 8)}...{review.walletAddress.slice(-6)}</p>
                <p>Files: {review.totalFiles} | Lines: {review.totalLines}</p>
              </div>

              <Button onClick={() => setSelectedId(review.generationId)}>
                Review
              </Button>
            </div>

            {review.flags && review.flags.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium">Security Flags:</p>
                {review.flags.slice(0, 2).map((flag: any, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    • {flag.message}
                  </div>
                ))}
                {review.flags.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{review.flags.length - 2} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
