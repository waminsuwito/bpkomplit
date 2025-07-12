
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function ScheduleCorHariIniPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Schedule Cor Hari Ini
        </CardTitle>
        <CardDescription>
          Kelola dan lihat jadwal pengecoran untuk hari ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Konten untuk halaman schedule cor hari ini akan ditampilkan di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
