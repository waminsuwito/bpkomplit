import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Fingerprint } from 'lucide-react';

export default function AbsensiHarianKaryawanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" />
          Absensi Harian
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk melakukan absensi harian akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
