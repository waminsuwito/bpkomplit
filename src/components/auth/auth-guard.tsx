
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is still being determined, do nothing and wait.
    if (isLoading) {
      return; 
    }
    
    const isLoginPage = pathname === '/';

    // If there is no user logged in...
    if (!user) {
      // ...and they are not on the login page, redirect them there.
      if (!isLoginPage) {
        router.replace('/');
      }
      return;
    }

    // If a user IS logged in and tries to access the login page,
    // redirect them away from it to their default dashboard.
    // This is the only redirect this component should handle for logged-in users.
    if (user && isLoginPage) {
      const destination = getDefaultRouteForUser(user);
      router.replace(destination);
    }
    
  }, [user, isLoading, router, pathname]);

  // While loading, or if we are redirecting, show a loader.
  if (isLoading || (!user && pathname !== '/') || (user && pathname === '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If all checks pass, render the children components.
  return <>{children}</>;
}

// This function remains the central logic for determining a user's default page.
export const getDefaultRouteForUser = (user: { jabatan?: string }): string => {
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
