
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole, type Jabatan } from '@/lib/types';


export function AuthGuard({ 
  children, 
  requiredRoles,
  requiredJabatans 
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
  requiredJabatans?: Jabatan[]
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    if (!user) {
      // If not logged in, redirect to the login page.
      router.replace('/');
      return;
    }
    
    // Check if the user is authorized for the current page
    let isAuthorized = true;
    if (requiredRoles && requiredRoles.length > 0) {
      isAuthorized = requiredRoles.includes(user.role);
    } else if (requiredJabatans && requiredJabatans.length > 0) {
      isAuthorized = requiredJabatans.includes(user.jabatan);
    }

    if (!isAuthorized) {
      // If user is logged in but not authorized, send them to their default page.
      // This handles cases where they might try to access a URL they shouldn't.
      const destination = getDefaultRouteForUser(user);
      router.replace(destination);
    }

  }, [user, isLoading, router, requiredRoles, requiredJabatans]);

  const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.jabatan) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
    }
    switch(user.role) {
      case 'super_admin': return '/admin/super-admin';
      case 'admin_lokasi': return '/admin/laporan-harian';
      case 'logistik_material': return '/admin/pemasukan-material';
      case 'hse_hrd': return '/admin/absensi-karyawan-hari-ini';
      case 'karyawan': return '/karyawan/absensi-harian';
      default: return '/';
    }
  };

  // Determine if the user is allowed to see the content.
  let canRenderContent = false;
  if (!isLoading && user) {
     canRenderContent = true; // Assume allowed by default if logged in
     if (requiredRoles && requiredRoles.length > 0) {
        canRenderContent = requiredRoles.includes(user.role);
     } else if (requiredJabatans && requiredJabatans.length > 0) {
        canRenderContent = requiredJabatans.includes(user.jabatan);
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
