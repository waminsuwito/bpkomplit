'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck } from 'lucide-react';

// Data contoh telah dihapus.
// Di aplikasi sesungguhnya, data ini akan diambil dari database (misalnya, Firestore).

export default function AbsensiKaryawanHariIniPage() {
  const [daftarAbsensi] = useState<any[]>([]);
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Absensi Karyawan Hari Ini
        </CardTitle>
        <CardDescription>
          Laporan absensi karyawan untuk tanggal: {tanggalHariIni}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {daftarAbsensi.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIK Karyawan</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead className="text-center">Absen Masuk</TableHead>
                  <TableHead className="text-center">Terlambat</TableHead>
                  <TableHead className="text-center">Absen Pulang</TableHead>
                  <TableHead className="text-center">Lembur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarAbsensi.map((item) => (
                  <TableRow key={item.nik}>
                    <TableCell className="font-medium">{item.nik}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell className="text-center">
                      {item.absenMasuk ? (
                        item.absenMasuk
                      ) : (
                        <Badge variant="outline">Belum Absen</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.terlambat ? (
                        <Badge variant="destructive">{item.terlambat}</Badge>
                      ) : (
                        item.absenMasuk ? '-' : <Badge variant="outline">-</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.absenPulang ? (
                        item.absenPulang
                      ) : (
                         item.absenMasuk ? <Badge variant="secondary">Belum Pulang</Badge> : <Badge variant="outline">-</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.lembur ? item.lembur : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>Belum ada data absensi untuk hari ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
