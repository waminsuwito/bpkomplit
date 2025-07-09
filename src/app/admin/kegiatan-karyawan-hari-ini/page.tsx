import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function KegiatanKaryawanHariIniPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Kegiatan Karyawan Hari Ini
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk mengelola kegiatan karyawan hari ini akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
