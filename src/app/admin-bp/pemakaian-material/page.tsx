
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function PemakaianMaterialPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Laporan Pemakaian Material
        </CardTitle>
        <CardDescription>
          Tinjau laporan pemakaian material untuk produksi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Konten untuk laporan pemakaian material akan ditampilkan di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
