
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole, type Jabatan } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.jabatan) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'SOPIR TM': return '/karyawan/checklist-harian-tm';
      case 'KEPALA MEKANIK': return '/karyawan/manajemen-alat';
      case 'KEPALA WORKSHOP': return '/karyawan/manajemen-alat';
      default: // Continue to check role-based routing
        break;
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
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Do nothing while loading
    }

    // If user is NOT logged in
    if (!user) {
      // Allow access only to the login page
      if (pathname !== '/') {
        router.replace('/');
      }
      return;
    }

    // If user IS logged in
    let isAuthorized = false;
    if (requiredRoles?.length) {
      isAuthorized = requiredRoles.includes(user.role);
    } else if (requiredJabatans?.length) {
      isAuthorized = requiredJabatans.includes(user.jabatan);
    }

    const defaultRoute = getDefaultRouteForUser(user);

    // If user is on the login page but is already logged in, redirect them
    if (pathname === '/') {
      router.replace(defaultRoute);
      return;
    }
    
    // If user is on a protected page but is not authorized, redirect to their default page
    if ((requiredRoles || requiredJabatans) && !isAuthorized) {
       router.replace(defaultRoute);
    }

  }, [user, isLoading, router, pathname, requiredRoles, requiredJabatans]);

  // Determine if the content should be rendered
  let canRenderContent = false;
  if (!isLoading) {
    if (pathname === '/') {
        // Show login page only if user is not logged in yet.
        canRenderContent = !user;
    } else if (user) {
        // For protected pages, check authorization.
        if (requiredRoles?.length) {
            canRenderContent = requiredRoles.includes(user.role);
        } else if (requiredJabatans?.length) {
            canRenderContent = requiredJabatans.includes(user.jabatan);
        } else {
            // Should not happen on protected pages, but as a fallback.
            canRenderContent = false; 
        }
    }
  }


  if (isLoading || !canRenderContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
