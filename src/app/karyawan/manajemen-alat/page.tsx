
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function ManajemenAlatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="h-6 w-6 text-primary" />
          Manajemen Alat
        </CardTitle>
        <CardDescription>
          Kelola dan pantau kondisi alat berat di sini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-16">
          <p>Halaman manajemen alat sedang dalam pengembangan.</p>
        </div>
      </CardContent>
    </Card>
  );
}
