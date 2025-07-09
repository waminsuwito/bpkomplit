'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page just redirects to the first available menu item.
export default function KaryawanRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/karyawan/absensi-harian');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
