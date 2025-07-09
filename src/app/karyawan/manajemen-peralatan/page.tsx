
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function ManajemenPeralatanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Manajemen Alat
        </CardTitle>
        <CardDescription>
          Halaman ini sedang dalam pengembangan. Fitur untuk mengelola peralatan akan tersedia di sini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-16">
          <p>Fitur Manajemen Alat akan segera hadir.</p>
        </div>
      </CardContent>
    </Card>
  );
}
