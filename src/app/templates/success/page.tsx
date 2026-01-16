'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download, ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TemplateSuccessPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const templateName = searchParams.get('templateName') || 'Template';
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600 mb-2">Purchase Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for purchasing <strong>{templateName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Download Your Template</h4>
                    <p className="text-sm text-muted-foreground">
                      Access your template files and documentation immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      We've sent a receipt and download link to your email
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="w-full py-3"
                onClick={() => window.location.href = `/dashboard/templates`}
              >
                View in Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full py-3"
                onClick={() => window.location.href = '/templates'}
              >
                Browse More Templates
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Order Details:</strong></p>
                <p>Template ID: {templateId}</p>
                <p>Transaction ID: {sessionId}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Need help with your template? Our support team is here to assist you.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => window.location.href = '/docs/support'}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/docs/tutorials'}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Tutorials
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
