
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User, type UserRole, type Jabatan } from '@/lib/types';

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
      return; // Wait until the user state is determined
    }

    const isLoginPage = pathname === '/';
    const defaultRoute = user ? getDefaultRouteForUser(user) : '/';

    // Case 1: User is not logged in
    if (!user) {
      if (!isLoginPage) {
        // If not logged in and not on the login page, redirect to login
        router.replace('/');
      }
      return;
    }

    // Case 2: User is logged in
    if (isLoginPage) {
      // If logged in and on the login page, redirect to their default route
      router.replace(defaultRoute);
      return;
    }

    // Case 3: User is logged in and on a protected page
    let isAuthorized = false;
    if (requiredRoles?.length) {
      isAuthorized = requiredRoles.includes(user.role);
    } else if (requiredJabatans?.length) {
      isAuthorized = requiredJabatans.includes(user.jabatan);
    }

    if ((requiredRoles || requiredJabatans) && !isAuthorized) {
      // If on a protected page but not authorized, redirect to their default page
      router.replace(defaultRoute);
    }

  }, [user, isLoading, router, pathname, requiredRoles, requiredJabatans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render children only if the logic above doesn't redirect
  // This avoids rendering a page flash before redirecting
  const isLoginPage = pathname === '/';
  if (!user && !isLoginPage) return null; // Don't render protected content if not logged in
  if (user && isLoginPage) return null; // Don't render login page if logged in

  return <>{children}</>;
}
