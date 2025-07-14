
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
      return; // Wait until auth state is confirmed from AuthProvider
    }

    const isLoginPage = pathname === '/';

    // SCENARIO 1: User is NOT logged in
    if (!user) {
      if (!isLoginPage) {
        // If not on login page, redirect there.
        router.replace('/');
      }
      // Allow rendering the login page
      return;
    }

    // SCENARIO 2: User IS logged in
    const defaultRoute = getDefaultRouteForUser(user);

    // If logged-in user is on the login page, redirect them to their dashboard.
    if (isLoginPage) {
      router.replace(defaultRoute);
      return;
    }

    // Authorization check: prevent users from accessing pages not meant for them.
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/admin-bp');
    const isKaryawanRoute = pathname.startsWith('/karyawan');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    const userDefaultRoute = getDefaultRouteForUser(user);
    const userIsAdmin = userDefaultRoute.startsWith('/admin') || userDefaultRoute.startsWith('/admin-bp');
    const userIsKaryawan = userDefaultRoute.startsWith('/karyawan');
    const userIsDashboard = userDefaultRoute.startsWith('/dashboard');

    // If an admin is trying to access a non-admin page, redirect them.
    if (userIsAdmin && !isAdminRoute) {
        router.replace(defaultRoute);
        return;
    }
    // If a karyawan is trying to access a non-karyawan page, redirect them.
    if (userIsKaryawan && !isKaryawanRoute) {
        router.replace(defaultRoute);
        return;
    }
    // If an operator is trying to access a non-dashboard page, redirect them.
    if (userIsDashboard && !isDashboardRoute) {
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

  // Prevent flashing content while redirecting
  if (!user && pathname !== '/') return null;
  if (user && pathname === '/') return null;

  return <>{children}</>;
}
