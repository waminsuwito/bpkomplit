
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DatabaseProduksiPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Database Produksi
                </CardTitle>
                <CardDescription>
                Lihat dan kelola riwayat data produksi yang telah disimpan.
                </CardDescription>
            </div>
            <Button asChild variant="outline">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Fitur database produksi akan tersedia di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
