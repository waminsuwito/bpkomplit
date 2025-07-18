
import { Header } from '@/components/dashboard/header';
import { AdminBpSidebar } from '@/components/admin-bp/admin-bp-sidebar';

export default function AdminBpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <AdminBpSidebar />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
  );
}
