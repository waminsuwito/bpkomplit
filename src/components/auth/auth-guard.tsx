
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole, type UserJabatan } from '@/lib/types';

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

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything while loading
    }

    if (!user) {
      // Not logged in, redirect to login page
      router.replace('/');
      return;
    }
    
    let isAuthorized = true;
    
    // Check for role requirement
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        isAuthorized = false;
      }
    }
    
    // Check for jabatan requirement
    if (requiredJabatan) {
      if (user.jabatan !== requiredJabatan) {
        isAuthorized = false;
      }
    }

    if (!isAuthorized) {
      // User is logged in but doesn't have the required role or jabatan. Redirect them.
      const isAdminType = user.role === 'super_admin' || user.role === 'admin_lokasi' || user.role === 'logistik_material' || user.role === 'hse_hrd_lokasi';
      if (user.jabatan === 'OPRATOR BP') {
        router.replace('/dashboard');
      } else if (isAdminType) {
        router.replace('/admin');
      } else if (user.role === 'karyawan') {
        router.replace('/karyawan');
      }
      else {
        router.replace('/'); // Fallback to login
      }
    }

  }, [user, isLoading, router, requiredRoles, requiredJabatan]);

  let isAllowed = !!user;
  if(requiredRoles && requiredRoles.length > 0 && user) {
    isAllowed = requiredRoles.includes(user.role);
  }
  if(requiredJabatan && user) {
    isAllowed = user.jabatan === requiredJabatan;
  }
  
  if (isLoading || !isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
