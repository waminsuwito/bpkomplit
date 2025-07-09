import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function RangkumanAbsensiKaryawanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Rangkuman Absensi Karyawan
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk menampilkan rangkuman absensi karyawan akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
