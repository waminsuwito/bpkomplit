
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the auth state is fully resolved.
    if (isLoading) {
      return; 
    }
    
    const isLoginPage = pathname === '/';

    // If there's no user and they're trying to access a protected page,
    // redirect them to the login page.
    if (!user && !isLoginPage) {
      router.replace('/');
      return;
    }

    // If there IS a user and they somehow land on the login page,
    // redirect them to their designated home page.
    if (user && isLoginPage) {
      const destination = getDefaultRouteForUser(user);
      router.replace(destination);
    }
    
  }, [user, isLoading, router, pathname]);

  // Show a loading screen while the initial user check is happening
  // or if a redirect is in progress.
  if (isLoading || (!user && pathname !== '/') || (user && pathname === '/')) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If all checks pass, render the protected page.
  return <>{children}</>;
}

export const getDefaultRouteForUser = (user: { jabatan?: string }): string => {
    const jabatan = user.jabatan;
    
    switch (jabatan) {
      case 'SUPER ADMIN': return '/admin/manajemen-karyawan';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'ADMIN LOGISTIK': return '/admin/pemakaian-spare-part';
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';
      case 'OPRATOR BP': return '/dashboard';
      case 'SOPIR TM': return '/karyawan/checklist-harian-tm';
      case 'KEPALA MEKANIK': return '/karyawan/manajemen-alat';
      case 'KEPALA WORKSHOP': return '/karyawan/manajemen-alat';
      default: return '/karyawan/absensi-harian';
    }
};
