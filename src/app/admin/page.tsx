
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminRootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user?.role === 'super_admin') {
      router.replace('/admin/super-admin');
    } else if (user?.role === 'admin_lokasi') {
      router.replace('/admin/laporan-harian');
    } else if (user?.role === 'logistik_material') {
      router.replace('/admin/pemasukan-material');
    } else if (user?.role === 'hse_hrd_lokasi') {
      router.replace('/admin/absensi-karyawan-hari-ini');
    } else if (user?.role === 'karyawan') {
      router.replace('/karyawan');
    } else if (user) {
      // If an unauthorized user somehow gets here, send them away
      router.replace('/dashboard');
    } else {
      // If no user, send to login
      router.replace('/');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
