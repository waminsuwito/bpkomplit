'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './login-dialog';

export function Header() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setIsLoginDialogOpen(false);
    router.push('/admin');
  };

  return (
    <>
      <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10">
        <div>
          <h1 className="text-2xl font-bold text-primary">PT. FARIKA RIAU PERKASA</h1>
          <p className="text-sm text-muted-foreground">Sistem Kontrol Otomatisasi Produksi Batching Plant</p>
        </div>
        <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>Admin Login</Button>
      </header>
      <LoginDialog 
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
