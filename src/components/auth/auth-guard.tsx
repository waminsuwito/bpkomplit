
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    const jabatan = user.jabatan;
    switch (jabatan) {
      // Admin Roles
      case 'SUPER ADMIN': return '/admin/super-admin';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'ADMIN LOGISTIK': return '/admin/laporan-harian';
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';

      // Operator Role
      case 'OPRATOR BP': return '/dashboard';
      
      // Karyawan with special pages
      case 'SOPIR TM': return '/karyawan/checklist-harian-tm';
      case 'KEPALA MEKANIK':
      case 'KEPALA WORKSHOP':
        return '/karyawan/manajemen-alat';

      // Default for all other 'karyawan' roles
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
    const isPublicPage = isLoginPage;

    // SCENARIO 1: User is NOT logged in
    if (!user) {
      if (!isPublicPage) {
        // If trying to access a protected page, redirect to login
        router.replace('/');
      }
      // Otherwise, allow rendering the public page (login page)
      return;
    }

    // SCENARIO 2: User IS logged in
    const defaultRoute = getDefaultRouteForUser(user);
    const isAdminRoute = defaultRoute.startsWith('/admin') || defaultRoute.startsWith('/admin-bp');
    const isKaryawanRoute = defaultRoute.startsWith('/karyawan');
    const isDashboardRoute = defaultRoute.startsWith('/dashboard');

    const accessingAdminPages = pathname.startsWith('/admin') || pathname.startsWith('/admin-bp');
    const accessingKaryawanPages = pathname.startsWith('/karyawan');
    const accessingDashboardPage = pathname.startsWith('/dashboard');

    if (isLoginPage) {
      // If on login page, redirect to their default dashboard
      router.replace(defaultRoute);
      return;
    }

    // Authorization checks
    if (isAdminRoute && !accessingAdminPages) {
      router.replace(defaultRoute);
      return;
    }
    if (isKaryawanRoute && !accessingKaryawanPages) {
      router.replace(defaultRoute);
      return;
    }
    if (isDashboardRoute && !accessingDashboardPage) {
      router.replace(defaultRoute);
      return;
    }

  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flashing content:
  // If user is not logged in, only render the login page.
  if (!user && pathname !== '/') return null;
  // If user is logged in, do not render the login page.
  if (user && pathname === '/') return null;

  return <>{children}</>;
}
