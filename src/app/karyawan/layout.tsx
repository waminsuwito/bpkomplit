import { Header } from '@/components/dashboard/header';
import { AuthGuard } from '@/components/auth/auth-guard';
import { KaryawanSidebar } from '@/components/karyawan/karyawan-sidebar';

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRoles={[
      "ADMIN BP",
      "ADMIN LOGISTIK",
      "ADMIN PRECAST",
      "ADMIN QC",
      "HELPER",
      "HELPER BP",
      "HELPER CP",
      "HELPER LABORAT",
      "HELPER LAS",
      "HELPER PRECAST",
      "HELPER TAMBAL BAN",
      "HRD",
      "HSE/K3",
      "KEP KOOR BP",
      "KEP KOOR QC",
      "KEP KOOR TEKNIK",
      "KEPALA BP",
      "KEPALA GUDANG",
      "KEPALA MEKANIK",
      "KEPALA OPRATOR",
      "KEPALA PRECAST",
      "KEPALA SOPIR",
      "KEPALA WORKSHOP",
      "LAYAR MONITOR",
      "OPRATOR BATA RINGAN",
      "OPRATOR BP",
      "OPRATOR CP",
      "OPRATOR LOADER",
      "OPRATOR PAVING",
      "QC",
      "SOPIR DT",
      "SOPIR TM",
      "TUKANG BOBOK",
      "TUKANG LAS",
    ]}>
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
