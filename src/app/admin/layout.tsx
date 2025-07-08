import { Header } from '@/components/dashboard/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRoles={['super_admin']}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
