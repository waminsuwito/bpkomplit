
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    const jabatan = user.jabatan;

    // Admin Roles
    if (jabatan === 'SUPER ADMIN') return '/admin/super-admin';
    if (jabatan === 'ADMIN BP') return '/admin-bp/schedule-cor-hari-ini';
    if (jabatan === 'ADMIN LOGISTIK') return '/admin/laporan-harian';
    if (jabatan === 'LOGISTIK MATERIAL') return '/admin/pemasukan-material';
    if (jabatan === 'HSE/K3') return '/admin/absensi-karyawan-hari-ini';

    // Operator Role
    if (jabatan === 'OPRATOR BP') return '/dashboard';
    
    // Karyawan with special pages
    if (jabatan === 'SOPIR TM') return '/karyawan/checklist-harian-tm';
    if (jabatan === 'KEPALA MEKANIK' || jabatan === 'KEPALA WORKSHOP') return '/karyawan/manajemen-alat';

    // Default for all other 'karyawan' roles
    return '/karyawan/absensi-harian';
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until the user state is determined from localStorage
    }

    const isLoginPage = pathname === '/';
    const isPublicPage = isLoginPage; // Can add more public pages here later if needed

    // If trying to access a protected page without being logged in, redirect to login
    if (!user && !isPublicPage) {
      router.replace('/');
      return;
    }

    if (user) {
      const defaultRoute = getDefaultRouteForUser(user);

      // If logged in, redirect away from login page to their default page
      if (isLoginPage) {
        router.replace(defaultRoute);
        return;
      }
      
      const isAdminPage = pathname.startsWith('/admin/') || pathname.startsWith('/admin-bp/');
      const isOperatorPage = pathname.startsWith('/dashboard');
      const isKaryawanPage = pathname.startsWith('/karyawan/');

      const userDefaultRoute = getDefaultRouteForUser(user);
      const isUserAdmin = userDefaultRoute.startsWith('/admin');
      const isUserOperator = userDefaultRoute.startsWith('/dashboard');
      const isUserKaryawan = userDefaultRoute.startsWith('/karyawan');
      
      // Authorization Checks:
      // If an admin tries to access a non-admin page, redirect them to their default admin page
      if (isUserAdmin && !isAdminPage) {
          router.replace(defaultRoute);
          return;
      }
      // If an operator tries to access a non-operator page, redirect them
      if (isUserOperator && !isOperatorPage) {
          router.replace(defaultRoute);
          return;
      }
      // If a karyawan tries to access a non-karyawan page, redirect them
      if (isUserKaryawan && !isKaryawanPage) {
          router.replace(defaultRoute);
          return;
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Prevent flashing content
  const isLoginPage = pathname === '/';
  if (!user && !isLoginPage) return null; // Don't render protected content if not logged in
  if (user && isLoginPage) return null; // Don't render login page if logged in

  return <>{children}</>;
}
