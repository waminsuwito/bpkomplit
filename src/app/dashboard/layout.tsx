
import { Header } from '@/components/dashboard/header';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
