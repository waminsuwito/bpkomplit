
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
      return; 
    }

    const isLoginPage = pathname === '/';

    if (!user && !isLoginPage) {
      router.replace('/');
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

  // If user is not logged in, and we are on the login page, let the login page render.
  // The login page itself will handle redirecting logged-in users away.
  if (!user && pathname === '/') {
     return <>{children}</>;
  }

  // If user is not logged in and not on the login page, the useEffect above will redirect.
  // While redirecting, show a loader.
  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  // At this point, user is logged in. Render the children.
  return <>{children}</>;
}
