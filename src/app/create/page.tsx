'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/factory');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to create page...</p>
      </div>
    </div>
  );
}
