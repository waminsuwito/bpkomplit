import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart } from 'lucide-react';

export default function RangkumanKegiatanKaryawanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AreaChart className="h-6 w-6 text-primary" />
          Rangkuman Kegiatan Karyawan
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk menampilkan rangkuman kegiatan karyawan akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
