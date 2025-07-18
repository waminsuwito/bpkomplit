
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardEdit } from 'lucide-react';

export default function WorkOrderPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardEdit className="h-6 w-6 text-primary" />
          Work Order (WO)
        </CardTitle>
        <CardDescription>
          Kelola dan lihat daftar Work Order untuk perbaikan dan pemeliharaan alat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-muted-foreground">
          <p>Halaman untuk manajemen Work Order akan ditampilkan di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
