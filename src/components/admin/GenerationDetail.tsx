'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface GenerationDetailProps {
  generationId: string;
  onBack: () => void;
}

export default function GenerationDetail({ generationId, onBack }: GenerationDetailProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          action,
          reviewNotes: notes,
          reviewedBy: 'admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(action === 'approve' ? 'Generation approved!' : 'Generation rejected and refunded.');
        onBack();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Queue
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Review Generation</CardTitle>
          <CardDescription>ID: {generationId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Review Notes</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Add your review notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              className="flex-1 gap-2"
              onClick={() => handleAction('approve')}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>

            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => handleAction('reject')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4" />
              Reject & Refund
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Rejected generations will be automatically refunded
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
