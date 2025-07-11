
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole, type UserJabatan } from '@/lib/types';

// Helper function to determine the correct default page for a user
const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    if (user.jabatan === 'OPRATOR BP') return '/dashboard';
    
    // Define a map for role-based default pages for cleaner logic
    const roleRedirects: Partial<Record<UserRole, string>> = {
        'super_admin': '/admin/super-admin',
        'admin_lokasi': '/admin/laporan-harian',
        'logistik_material': '/admin/pemasukan-material',
        'hse_hrd_lokasi': '/admin/absensi-karyawan-hari-ini'
    };
    
    if (roleRedirects[user.role]) {
        return roleRedirects[user.role]!;
    }
    
    // Fallback for general karyawan and other roles
    if (user.role.startsWith('karyawan') || user.role === 'operator') {
        return '/karyawan/absensi-harian';
    }

    return '/'; // Default fallback
};


export function AuthGuard({ 
  children, 
  requiredRoles,
  requiredJabatan
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
  requiredJabatan?: UserJabatan
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything while loading
    }

    if (!user) {
      // Not logged in, redirect to login page if not already there
      if (pathname !== '/') {
        router.replace('/');
      }
      return;
    }
    
    // User is logged in, check authorization for the current page
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

    if (!isAuthorized) {
      // User is not authorized for THIS page, redirect them to THEIR default page.
      const defaultRoute = getDefaultRouteForUser(user);
      router.replace(defaultRoute);
    }

  }, [user, isLoading, router, requiredRoles, requiredJabatan, pathname]);

  // Determine if the user is allowed based on role/jabatan for rendering purposes
  let isAllowedToRender = false;
  if (!isLoading && user) {
     isAllowedToRender = true; // Assume allowed if no specific requirements are given
     if (requiredRoles && requiredRoles.length > 0) {
        isAllowedToRender = requiredRoles.includes(user.role);
     }
     if (requiredJabatan) {
        isAllowedToRender = isAllowedToRender && user.jabatan === requiredJabatan;
     }
  }

  if (isLoading || !user || !isAllowedToRender) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
