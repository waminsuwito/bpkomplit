
'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, Loader2, Fingerprint, ArrowLeft } from 'lucide-react';
import React from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10 no-print">
        <div className="flex items-center gap-4">
          <Image
            src="https://i.ibb.co/V0NgdX7z/images.jpg"
            alt="PT. FARIKA RIAU PERKASA Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary">PT. FARIKA RIAU PERKASA</h1>
            <p className="text-sm text-muted-foreground">One Stop Concrete Solution</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" />
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground">{user.jabatan || formatRoleName(user.role)}</p>
            </div>
            
             {user?.jabatan === 'OPRATOR BP' && pathname.startsWith('/dashboard') && (
              <Button asChild variant="outline" size="sm">
                <Link href="/karyawan">
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Absen & Kegiatan
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </header>
    </>
  );
}
