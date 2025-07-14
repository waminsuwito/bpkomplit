
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
        return '/dashboard';
    }
    
    // Default for all other employee roles
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

    if (!user) {
      if (!isLoginPage) {
        router.replace('/');
      }
      return;
    }

    if (isLoginPage) {
        router.replace(getDefaultRouteForUser(user));
        return;
    }
    
    if (!user.jabatan) {
        router.replace('/');
        return;
    }

    const allowedPrefix = getAllowedPrefix(user.jabatan);
    let isAuthorized = pathname.startsWith(allowedPrefix);

    // Special case for OPRATOR BP who can also access /karyawan
    if (user.jabatan === 'OPRATOR BP' && pathname.startsWith('/karyawan')) {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        router.replace(getDefaultRouteForUser(user));
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
