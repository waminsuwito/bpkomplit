

import { Header } from '@/components/dashboard/header';
import { KaryawanSidebar } from '@/components/karyawan/karyawan-sidebar';

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <KaryawanSidebar />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
  );
}
