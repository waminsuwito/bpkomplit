

import { Header } from '@/components/dashboard/header';
import { AuthGuard } from '@/components/auth/auth-guard';
import { KaryawanSidebar } from '@/components/karyawan/karyawan-sidebar';
import { jabatanOptions } from '@/lib/types';

// All jabatans that are NOT admins or special operator roles are considered 'karyawan'
const karyawanJabatans = jabatanOptions.filter(j => 
    !['SUPER ADMIN', 'ADMIN LOGISTIK', 'LOGISTIK MATERIAL', 'HSE/K3', 'ADMIN BP'].includes(j)
);


export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredJabatans={karyawanJabatans}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <KaryawanSidebar />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
