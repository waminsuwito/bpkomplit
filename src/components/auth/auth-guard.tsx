
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    const jabatan = user.jabatan;
    
    switch (jabatan) {
      case 'SUPER ADMIN': return '/admin/super-admin';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'ADMIN LOGISTIK': return '/admin/laporan-harian';
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';
      case 'OPRATOR BP': return '/dashboard';
      case 'SOPIR TM': return '/karyawan/checklist-harian-tm';
      case 'KEPALA MEKANIK': return '/karyawan/manajemen-alat';
      case 'KEPALA WORKSHOP': return '/karyawan/manajemen-alat';
      default: return '/karyawan/absensi-harian';
    }
};

const getAllowedPrefix = (jabatan: User['jabatan']): string => {
    const adminRoles = ['SUPER ADMIN', 'ADMIN LOGISTIK', 'LOGISTIK MATERIAL', 'HSE/K3'];
    if (adminRoles.includes(jabatan)) {
        return '/admin';
    }
    if (jabatan === 'ADMIN BP') {
        return '/admin-bp';
    }
    if (jabatan === 'OPRATOR BP') {
        // Operator BP can access dashboard and karyawan pages
        return '/dashboard'; // Primary prefix
    }
    // All other roles are considered 'karyawan'
    return '/karyawan';
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; 
    }
    
    const isLoginPage = pathname === '/';

    // Case 1: User is not logged in
    if (!user) {
      if (!isLoginPage) {
        router.replace('/');
      }
      return;
    }

    // Case 2: User IS logged in
    const { jabatan } = user;
    if (!jabatan) {
        // If user object is malformed, send to login
        router.replace('/');
        return;
    }
    
    const defaultRoute = getDefaultRouteForUser(user);
    const allowedPrefix = getAllowedPrefix(jabatan);

    if (isLoginPage) {
      router.replace(defaultRoute);
      return;
    }

    // Case 3: Authorization Check for Logged-in Users
    let isAuthorized = pathname.startsWith(allowedPrefix);
    
    // Special case for OPRATOR BP who can also access /karyawan
    if (jabatan === 'OPRATOR BP' && pathname.startsWith('/karyawan')) {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        // If the user is in the wrong section, redirect them to their correct dashboard.
        router.replace(defaultRoute);
    }

  }, [user, isLoading, router, pathname]);

  // Render loading screen while checking auth state, or if a redirect is imminent
  if (isLoading || (!user && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render the children (the actual page) if everything is okay
  return <>{children}</>;
}
