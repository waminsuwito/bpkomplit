
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User, type UserRole, type UserJabatan } from '@/lib/types';

// This helper MUST stay in sync with the one in AuthProvider
const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    if (user.jabatan === 'OPRATOR BP') return '/dashboard';
    if (user.jabatan === 'ADMIN BP') return '/admin-bp/schedule-cor-hari-ini';
    
    const roleRedirects: Partial<Record<UserRole, string>> = {
        'super_admin': '/admin/super-admin',
        'admin_lokasi': '/admin/laporan-harian',
        'logistik_material': '/admin/pemasukan-material',
        'hse_hrd_lokasi': '/admin/absensi-karyawan-hari-ini'
    };
    
    if (roleRedirects[user.role]) {
        return roleRedirects[user.role]!;
    }
    
    if (user.role.startsWith('karyawan') || user.role === 'operator') {
        return '/karyawan/absensi-harian';
    }

    return '/'; // Default fallback
};


export function AuthGuard({ 
  children, 
  requiredRoles,
  requiredJabatan,
  requiredJabatans
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
  requiredJabatan?: UserJabatan,
  requiredJabatans?: UserJabatan[]
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Do nothing while loading authentication state
    }

    if (!user) {
      // If not logged in, redirect to the login page.
      // This is the primary protection for all guarded routes.
      router.replace('/');
      return;
    }
    
    // User is logged in. Now, check if they are authorized for the *current* page.
    let isAuthorized = true;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        isAuthorized = false;
      }
    }
    if (requiredJabatan) {
      if (user.jabatan !== requiredJabatan) {
        isAuthorized = false;
      }
    }
    if (requiredJabatans && requiredJabatans.length > 0) {
        if (!user.jabatan || !requiredJabatans.includes(user.jabatan)) {
            isAuthorized = false;
        }
    }


    if (!isAuthorized) {
      // If the user is logged in but not authorized for THIS specific page,
      // redirect them to THEIR default page. This prevents access to wrong sections.
      const defaultRoute = getDefaultRouteForUser(user);
      router.replace(defaultRoute);
    }

  }, [user, isLoading, router, requiredRoles, requiredJabatan, requiredJabatans, pathname]);

  // Determine if the user is allowed to see the content.
  // This prevents flashing unauthorized content before a redirect can happen.
  let canRenderContent = false;
  if (!isLoading && user) {
     canRenderContent = true; // Assume allowed by default if logged in
     if (requiredRoles && requiredRoles.length > 0) {
        canRenderContent = requiredRoles.includes(user.role);
     }
     if (requiredJabatan) {
        canRenderContent = canRenderContent && user.jabatan === requiredJabatan;
     }
     if (requiredJabatans && requiredJabatans.length > 0) {
        canRenderContent = canRenderContent && !!user.jabatan && requiredJabatans.includes(user.jabatan);
     }
  }
  
  // While loading or if content shouldn't be rendered, show a spinner.
  if (isLoading || !canRenderContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
