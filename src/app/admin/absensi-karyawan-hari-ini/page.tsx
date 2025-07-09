import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export default function AbsensiKaryawanHariIniPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Absensi Karyawan Hari Ini
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk mengelola absensi karyawan hari ini akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
