
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User, type UserRole } from '@/lib/types';

const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.role) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'SUPER ADMIN': return '/admin/super-admin';
      case 'ADMIN LOGISTIK': return '/admin/laporan-harian'; // Placeholder, adjust if needed
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';
      default: return '/karyawan/absensi-harian';
    }
};


export function AuthGuard({ 
  children, 
  requiredRoles,
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    if (!user) {
      // If not logged in, redirect to the login page.
      // This protects all guarded routes.
      router.replace('/');
      return;
    }
    
    // Check if the user is authorized for the current page
    let isAuthorized = true;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        isAuthorized = false;
      }
    }

    if (!isAuthorized) {
      // If the user is logged in but not authorized for this specific page,
      // redirect them to their default page.
      const defaultRoute = getDefaultRouteForUser(user);
      router.replace(defaultRoute);
    }

  }, [user, isLoading, router, requiredRoles, pathname]);

  // Determine if the user is allowed to see the content.
  // This prevents flashing unauthorized content before a redirect can happen.
  let canRenderContent = false;
  if (!isLoading && user) {
     canRenderContent = true; // Assume allowed by default if logged in
     if (requiredRoles && requiredRoles.length > 0) {
        canRenderContent = requiredRoles.includes(user.role);
     }
  }
  
  // While loading or if content shouldn't be rendered yet, show a spinner.
  if (isLoading || !canRenderContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
