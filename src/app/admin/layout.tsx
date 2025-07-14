
'use client';

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

const ALLOWED_ROLES = ['SUPER ADMIN', 'ADMIN LOGISTIK', 'LOGISTIK MATERIAL', 'HSE/K3'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for user data to be loaded
    }

    if (!user || !user.jabatan || !ALLOWED_ROLES.includes(user.jabatan)) {
      // If user is not an authorized admin, kick them out.
      router.replace('/'); 
    }
  }, [user, isLoading, router]);

  // While loading or if user is unauthorized, show a loading screen to prevent content flash
  if (isLoading || !user || !user.jabatan || !ALLOWED_ROLES.includes(user.jabatan)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authorized, render the admin layout
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
