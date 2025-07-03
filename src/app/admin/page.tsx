import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { JobMixForm } from '@/components/admin/job-mix-form';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 flex justify-center items-start">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Job Mix Formula</CardTitle>
            <CardDescription>Create a new concrete formula. All weight values should be in Kilograms (Kg).</CardDescription>
          </CardHeader>
          <CardContent>
            <JobMixForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
