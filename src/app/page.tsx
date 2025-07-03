import { Dashboard } from '@/components/dashboard/dashboard';
import { Header } from '@/components/dashboard/header';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <Dashboard />
      </main>
    </div>
  );
}
