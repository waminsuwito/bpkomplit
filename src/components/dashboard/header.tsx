
'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { UserCircle, LogOut, Fingerprint, Settings, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChangePasswordDialog } from '@/components/dashboard/change-password-dialog';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10 no-print">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="PT. FARIKA RIAU PERKASA Logo"
            width={45}
            height={45}
            className="rounded-full"
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
            
             {user?.jabatan === 'OPRATOR BP' && (
              <Button asChild variant="outline" size="sm">
                <Link href="/karyawan">
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Absen & Kegiatan
                </Link>
              </Button>
            )}

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Setting
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/tombol-manual">Tombol Manual</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/job-mix-formula">Job Mix Formula</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/mixing-settings">Pengaturan Lanjutan</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/dashboard/mixer-timer-settings">Timer Pintu Mixer</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/dashboard/relay-settings">Setting Relay</Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPasswordDialogOpen(true)}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Ubah Password</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </header>
       {user && (
        <ChangePasswordDialog
          isOpen={isPasswordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          userId={user.id}
        />
      )}
    </>
  );
}
