
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
      case 'KEPALA MEKANIK':
      case 'KEPALA WORKSHOP':
        return '/karyawan/manajemen-alat';
      default: return '/karyawan/absensi-harian';
    }
};


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until auth state is confirmed
    }

    const isLoginPage = pathname === '/';

    // SCENARIO 1: User is NOT logged in
    if (!user) {
      if (!isLoginPage) {
        router.replace('/');
      }
      return; // Allow rendering the login page
    }

    // SCENARIO 2: User IS logged in
    const defaultRoute = getDefaultRouteForUser(user);

    // If logged-in user is on the login page, redirect them away.
    if (isLoginPage) {
      router.replace(defaultRoute);
      return;
    }

    // Authorization check: prevent users from accessing pages not meant for them.
    const isAdminPage = pathname.startsWith('/admin');
    const isAdminBpPage = pathname.startsWith('/admin-bp');
    const isKaryawanPage = pathname.startsWith('/karyawan');
    const isDashboardPage = pathname.startsWith('/dashboard');

    const jabatan = user.jabatan;
    let isAuthorized = false;

    if (jabatan === 'SUPER ADMIN' && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'ADMIN BP' && isAdminBpPage) {
        isAuthorized = true;
    } else if ((jabatan === 'ADMIN LOGISTIK' || jabatan === 'LOGISTIK MATERIAL' || jabatan === 'HSE/K3') && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'OPRATOR BP' && isDashboardPage) {
        isAuthorized = true;
    } else if (jabatan.includes('SOPIR') || jabatan.includes('HELPER') || jabatan.includes('KEPALA') || jabatan.includes('QC') || jabatan.includes('OPRATOR')) {
        // This is a broad catch for various employee roles.
        // OPRATOR BP is handled above, so this will catch the other operators.
        if (isKaryawanPage) {
          isAuthorized = true;
        }
    }

    // A final check for specific employee roles that might have been missed
    if (!isAuthorized && (jabatan === 'SOPIR TM' || jabatan === 'KEPALA MEKANIK' || jabatan === 'KEPALA WORKSHOP' || jabatan.startsWith('HELPER')) && isKaryawanPage) {
        isAuthorized = true;
    }


    if (!isAuthorized) {
        router.replace(defaultRoute);
    }

  }, [user, isLoading, router, pathname]);

  // Render a loading indicator while checking auth status.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flashing content while redirecting
  if ((!user && pathname !== '/') || (user && pathname === '/')) {
      return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return <>{children}</>;
}
