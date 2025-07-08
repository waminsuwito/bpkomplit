"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/');
      } else if (requiredRole && user.role !== requiredRole) {
        // If the user does not have the required role, log them out and redirect.
        logout();
      }
    }
  }, [user, isLoading, router, requiredRole, logout]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
