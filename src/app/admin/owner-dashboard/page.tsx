
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

export default function OwnerDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Owner Dashboard
        </CardTitle>
        <CardDescription>
          Halaman ini disediakan khusus untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-24 text-muted-foreground">
          <p>Dasbor khusus untuk Owner akan ditampilkan di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
