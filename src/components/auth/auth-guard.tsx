
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type UserRole, type Jabatan } from '@/lib/types';

export function AuthGuard({ 
  children, 
  requiredRoles,
  requiredJabatans 
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
  requiredJabatans?: Jabatan[]
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    if (!user) {
      // If not logged in, redirect to the login page.
      router.replace('/');
      return;
    }
    
    // Check if the user is authorized for the current page
    let isAuthorized = false;
    if (requiredRoles && requiredRoles.length > 0) {
      isAuthorized = requiredRoles.includes(user.role);
    } else if (requiredJabatans && requiredJabatans.length > 0) {
      isAuthorized = requiredJabatans.includes(user.jabatan);
    }

    if (!isAuthorized) {
      // If user is logged in but not authorized for THIS page, send them to login.
      // The AuthProvider will then redirect them to their correct default page.
      router.replace('/');
    }

  }, [user, isLoading, router, requiredRoles, requiredJabatans]);

  // Determine if the user is allowed to see the content.
  let canRenderContent = false;
  if (!isLoading && user) {
     if (requiredRoles && requiredRoles.length > 0) {
        canRenderContent = requiredRoles.includes(user.role);
     } else if (requiredJabatans && requiredJabatans.length > 0) {
        canRenderContent = requiredJabatans.includes(user.jabatan);
     }
  }
  
  if (isLoading || !canRenderContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
