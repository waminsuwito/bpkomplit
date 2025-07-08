
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function ScheduleCorPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Schedule Cor Hari Ini
          </CardTitle>
          <CardDescription>
            Lihat dan kelola jadwal pengecoran untuk hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Fitur jadwal pengecoran sedang dalam pengembangan.</p>
            <p>Silakan kembali lagi nanti.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
