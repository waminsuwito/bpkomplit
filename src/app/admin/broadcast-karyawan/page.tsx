import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function BroadcastKaryawanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Broadcast Karyawan
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Konten untuk mengirim pesan broadcast ke karyawan akan ditampilkan di sini.</p>
      </CardContent>
    </Card>
  );
}
