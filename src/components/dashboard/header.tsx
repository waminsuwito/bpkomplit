'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './login-dialog';
import Image from 'next/image';

export function Header() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    router.push('/admin');
  };

  const handleLogout = () => {
    router.push('/');
  };

  const isAdminPage = pathname === '/admin';

  return (
    <>
      <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10">
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
            <p className="text-sm text-muted-foreground">Sistem Kontrol Otomatisasi Produksi Batching Plant</p>
          </div>
        </div>
        {isAdminPage ? (
          <Button variant="outline" onClick={handleLogout}>Keluar</Button>
        ) : (
          <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>Admin Login</Button>
        )}
      </header>
      {!isAdminPage && (
        <LoginDialog 
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
