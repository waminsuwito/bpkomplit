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

// Data contoh untuk demonstrasi.
// Di aplikasi sesungguhnya, data ini akan diambil dari database (misalnya, Firestore).
const mockAbsensiData = [
  {
    nik: '12345',
    nama: 'Budi Santoso',
    absenMasuk: '08:05',
    terlambat: '5 menit',
    absenPulang: '17:02',
    lembur: '2 menit',
  },
  {
    nik: '12346',
    nama: 'Ani Yudhoyono',
    absenMasuk: '07:58',
    terlambat: null,
    absenPulang: '17:00',
    lembur: null,
  },
  {
    nik: '12347',
    nama: 'Citra Kirana',
    absenMasuk: '08:15',
    terlambat: '15 menit',
    absenPulang: null, // Belum absen pulang
    lembur: null,
  },
  {
    nik: '12348',
    nama: 'Doni Salmanan',
    absenMasuk: '07:55',
    terlambat: null,
    absenPulang: '18:30',
    lembur: '1 jam 30 menit',
  },
    {
    nik: '12349',
    nama: 'Eka Kurniawan',
    absenMasuk: null, // Tidak masuk
    terlambat: null,
    absenPulang: null,
    lembur: null,
  },
];

export default function AbsensiKaryawanHariIniPage() {
  const [daftarAbsensi] = useState(mockAbsensiData);
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
