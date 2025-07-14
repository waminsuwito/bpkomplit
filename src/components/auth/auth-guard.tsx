
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    const jabatan = user.jabatan;
    
    // Explicit route mapping for all roles
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
      // Default fallback for all other employee roles
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
    if (!jabatan) { // If user object exists but jabatan is somehow missing, redirect to login
        router.replace('/');
        return;
    }

    let isAuthorized = false;
    const isAdminPage = pathname.startsWith('/admin');
    const isAdminBpPage = pathname.startsWith('/admin-bp');
    const isDashboardPage = pathname.startsWith('/dashboard');
    const isKaryawanPage = pathname.startsWith('/karyawan');
    
    const adminRoles = ['SUPER ADMIN', 'ADMIN LOGISTIK', 'LOGISTIK MATERIAL', 'HSE/K3'];

    if (adminRoles.includes(jabatan) && isAdminPage) {
        isAuthorized = true;
    } else if (jabatan === 'ADMIN BP' && isAdminBpPage) {
        isAuthorized = true;
    } else if (jabatan === 'OPRATOR BP' && isDashboardPage) {
        isAuthorized = true;
    } else if (!adminRoles.includes(jabatan) && jabatan !== 'ADMIN BP' && isKaryawanPage) {
        // Any role that is NOT an admin role is considered a 'karyawan' for this purpose
        isAuthorized = true;
    } else if (jabatan === 'OPRATOR BP' && isKaryawanPage) {
        // Allow OPRATOR BP to access karyawan pages too
        isAuthorized = true;
    }
    
    if (!isAuthorized) {
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
