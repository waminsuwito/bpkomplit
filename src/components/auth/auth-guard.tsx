
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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; 
    }
    
    const isLoginPage = pathname === '/';

    if (!user) {
      if (!isLoginPage) {
        router.replace('/');
      }
      return;
    }
    
    // User is logged in
    const defaultRoute = getDefaultRouteForUser(user);

    if (isLoginPage) {
        router.replace(defaultRoute);
        return;
    }

    // Authorization checks for logged-in users
    const { jabatan } = user;
    if (!jabatan) return; // Prevent errors if jabatan is missing

    let isAuthorized = false;
    const isKaryawanPage = pathname.startsWith('/karyawan');
    const isAdminPage = pathname.startsWith('/admin');
    const isAdminBpPage = pathname.startsWith('/admin-bp');
    const isDashboardPage = pathname.startsWith('/dashboard');

    if (jabatan === 'SUPER ADMIN' && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'ADMIN LOGISTIK' && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'LOGISTIK MATERIAL' && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'HSE/K3' && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'ADMIN BP' && isAdminBpPage) {
        isAuthorized = true;
    } else if (jabatan === 'OPRATOR BP' && (isDashboardPage || isKaryawanPage)) {
        isAuthorized = true;
    } else if (jabatan.includes('SOPIR') || jabatan.includes('HELPER') || jabatan.includes('KEPALA') || jabatan.includes('QC') || jabatan.includes('OPRATOR')) {
        // This is a broad catch for various employee roles.
        // OPRATOR BP is handled above, so this will catch the other operators.
        if (isKaryawanPage) {
            isAuthorized = true;
        }
    }
    
    if (!isAuthorized && pathname !== defaultRoute) {
        router.replace(defaultRoute);
    }

  }, [user, isLoading, router, pathname]);

  if (isLoading || (!user && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return <>{children}</>;
}
