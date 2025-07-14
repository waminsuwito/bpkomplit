
import { Header } from '@/components/dashboard/header';
import { AuthGuard } from '@/components/auth/auth-guard';
import { KaryawanSidebar } from '@/components/karyawan/karyawan-sidebar';
import { userRoles } from '@/lib/types';

// Define roles that are NOT considered standard 'karyawan'
const nonKaryawanRoles = ['SUPER ADMIN', 'ADMIN BP', 'OPRATOR BP'];

// Filter the main userRoles list to get all standard karyawan roles
const karyawanRoles = userRoles.filter(role => !nonKaryawanRoles.includes(role));

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRoles={karyawanRoles}>
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
