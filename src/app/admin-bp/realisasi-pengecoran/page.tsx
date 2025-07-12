
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export default function RealisasiPengecoranPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Realisasi Pengecoran
        </CardTitle>
        <CardDescription>
          Lihat laporan realisasi hasil pengecoran.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Konten untuk halaman realisasi pengecoran akan ditampilkan di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
