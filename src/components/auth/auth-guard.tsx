"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole } from '@/lib/types';

export function AuthGuard({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything while loading
    }

    if (!user) {
      // Not logged in, redirect to login page
      router.replace('/');
      return;
    }

    // Check if the route requires specific roles
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      // User is logged in but doesn't have the required role. Redirect them.
      // Check if they are an admin type trying to access non-admin pages or vice versa
      const isAdminType = user.role === 'super_admin' || user.role === 'admin_lokasi' || user.role === 'logistik_material' || user.role === 'hse_hrd_lokasi';
      if (isAdminType) {
        router.replace('/admin');
      } else if (user.role === 'karyawan') {
        router.replace('/karyawan');
      }
      else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router, requiredRoles]);

  // Determine if the user is authorized to see the content
  const isAuthorized = !!user && (!requiredRoles || requiredRoles.length === 0 || requiredRoles.includes(user.role));

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
