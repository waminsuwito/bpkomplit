
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Loader2 } from 'lucide-react';
import { getDefaultRouteForUser } from '@/lib/auth-guard-helper';

// This page now only serves to redirect a user if they somehow land here.
// The main redirection logic is in AuthProvider.
export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDefaultRouteForUser(user));
    }
  }, [user, isLoading, router]);

  return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
}
