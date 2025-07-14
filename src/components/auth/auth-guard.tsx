
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User, type Jabatan } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.jabatan) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'SOPIR TM': return '/karyawan/checklist-harian-tm';
      case 'KEPALA MEKANIK': return '/karyawan/manajemen-alat';
      case 'KEPALA WORKSHOP': return '/karyawan/manajemen-alat';
      case 'SUPER ADMIN': return '/admin/super-admin';
      case 'ADMIN LOGISTIK': return '/admin/laporan-harian';
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';
      // Default for all other jabatans
      default: return '/karyawan/absensi-harian';
    }
};

export function AuthGuard({ 
  children, 
  requiredJabatans 
}: { 
  children: React.ReactNode, 
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

    // Case 1: User is not logged in
    if (!user) {
      if (!isLoginPage) {
        // If not logged in and not on the login page, redirect to login
        router.replace('/');
      }
      return;
    }

    // Case 2: User is logged in
    const defaultRoute = getDefaultRouteForUser(user);
    if (isLoginPage) {
      // If logged in and on the login page, redirect to their default route
      router.replace(defaultRoute);
      return;
    }

    // Case 3: User is logged in and on a protected page
    if (requiredJabatans) {
      const isAuthorized = requiredJabatans.includes(user.jabatan);
      if (!isAuthorized) {
        // If on a protected page but not authorized, redirect to their default page
        router.replace(defaultRoute);
      }
    }

  }, [user, isLoading, router, pathname, requiredJabatans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render children only if the logic above doesn't redirect
  const isLoginPage = pathname === '/';
  if (!user && !isLoginPage) return null; // Don't render protected content if not logged in
  if (user && isLoginPage) return null; // Don't render login page if logged in

  return <>{children}</>;
}
