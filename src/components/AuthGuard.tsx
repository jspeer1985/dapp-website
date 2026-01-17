'use client';

import { useWallet } from '@/hooks/useWallet';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

// Pages that require authentication
const PROTECTED_ROUTES = ['/factory', '/launch', '/success', '/cancelled'];

export default function AuthGuard({ children, requireAuth = false, fallback }: AuthGuardProps) {
  const { connected } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check if current route requires authentication
  const needsAuth = requireAuth || PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

  // If auth is not required, just render children
  if (!needsAuth) {
    return <>{children}</>;
  }

  // If user is connected, render children
  if (connected) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default auth required screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Wallet className="h-5 w-5" />
            Wallet Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You need to connect your wallet to access this page.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
              variant="outline"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
