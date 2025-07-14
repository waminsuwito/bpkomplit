
"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { type User, type UserRole } from '@/lib/types';


export function AuthGuard({ 
  children, 
  requiredRoles,
}: { 
  children: React.ReactNode, 
  requiredRoles?: UserRole[],
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    let isAuthorized = true;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        isAuthorized = false;
      }
    }

    if (!isAuthorized) {
      // If user is logged in but not authorized, send back to login page.
      // The login page will then handle redirecting them to their correct default page.
      router.replace('/');
    }

  }, [user, isLoading, router, requiredRoles, pathname]);

  // Determine if the user is allowed to see the content.
  let canRenderContent = false;
  if (!isLoading && user) {
     canRenderContent = true; // Assume allowed by default if logged in
     if (requiredRoles && requiredRoles.length > 0) {
        canRenderContent = requiredRoles.includes(user.role);
     }
  }
  
  // While loading or if content shouldn't be rendered yet, show a spinner.
  if (isLoading || !canRenderContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
