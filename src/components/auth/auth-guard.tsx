
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

// This function defines the "home" prefix for each role.
const getAllowedPrefix = (jabatan?: User['jabatan']): string => {
    if (!jabatan) return '';
    
    const adminRoles = ['SUPER ADMIN', 'ADMIN LOGISTIK', 'LOGISTIK MATERIAL', 'HSE/K3'];
    if (adminRoles.includes(jabatan)) {
        return '/admin';
    }
    if (jabatan === 'ADMIN BP') {
        return '/admin-bp';
    }
    if (jabatan === 'OPRATOR BP') {
        return '/dashboard'; // OPRATOR BP has two allowed prefixes, this is the primary one.
    }
    
    // Default for all other roles
    return '/karyawan';
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Wait until the AuthProvider is done loading the user from localStorage.
    if (isLoading) {
      return; 
    }
    
    const isLoginPage = pathname === '/';

    // 2. If the user is NOT logged in:
    if (!user) {
      // If they are not on the login page, redirect them there.
      if (!isLoginPage) {
        router.replace('/');
      }
      return;
    }

    // 3. If the user IS logged in:
    if (!user.jabatan) {
        // Handle malformed user object
        router.replace('/');
        return;
    }

    // If they are on the login page, redirect them to their default dashboard.
    if (isLoginPage) {
        router.replace(getDefaultRouteForUser(user));
        return;
    }
    
    // 4. Authorization check: Ensure user is in the correct section of the app.
    const allowedPrefix = getAllowedPrefix(user.jabatan);
    let isAuthorized = pathname.startsWith(allowedPrefix);

    // Special case for OPRATOR BP who can also access /karyawan
    if (user.jabatan === 'OPRATOR BP' && pathname.startsWith('/karyawan')) {
        isAuthorized = true;
    }

    // If they are in the wrong section, redirect them to their default dashboard.
    if (!isAuthorized) {
        router.replace(getDefaultRouteForUser(user));
    }

  }, [user, isLoading, router, pathname]);

  // While loading, or if redirecting, show a loader to prevent flicker.
  if (isLoading || (!user && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If the user is logged in and on a valid page, or if they are on the login page, render the content.
  return <>{children}</>;
}
