
'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Printer } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import type { GlobalAttendanceRecord } from '@/lib/types';
import { format } from 'date-fns';
import { printElement } from '@/lib/utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GLOBAL_ATTENDANCE_KEY = 'app-global-attendance-records';

export default function AbsensiKaryawanHariIniPage() {
  const { user } = useAuth();
  const [daftarAbsensi, setDaftarAbsensi] = useState<GlobalAttendanceRecord[]>([]);
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!user) return;

    try {
      const storedData = localStorage.getItem(GLOBAL_ATTENDANCE_KEY);
      if (storedData) {
        const allRecords: GlobalAttendanceRecord[] = JSON.parse(storedData);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const filteredRecords = allRecords.filter(
          (record) => record.date === today && record.location === user.location
        );
        
        setDaftarAbsensi(filteredRecords);
      }
    } catch (error) {
      console.error("Failed to load global attendance data", error);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader className="no-print">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              Absensi Karyawan Hari Ini
            </CardTitle>
            <CardDescription>
              Laporan absensi karyawan untuk lokasi {user?.location || '...'} pada tanggal: {tanggalHariIni}
            </CardDescription>
          </div>
          <Button onClick={() => printElement('print-content')}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
        </div>
      </CardHeader>
      <CardContent id="print-content">
        <div className="print-only mb-6 text-center">
            <h1 className="text-xl font-bold">Laporan Absensi Harian</h1>
            <p className="text-sm">Lokasi: {user?.location || '...'}</p>
            <p className="text-sm">Tanggal: {tanggalHariIni}</p>
        </div>

        {daftarAbsensi.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIK Karyawan</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Foto Masuk</TableHead>
                  <TableHead className="text-center">Absen Masuk</TableHead>
                  <TableHead className="text-center">Terlambat</TableHead>
                  <TableHead>Foto Pulang</TableHead>
                  <TableHead className="text-center">Absen Pulang</TableHead>
                  <TableHead className="text-center">Lembur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarAbsensi.map((item) => (
                  <TableRow key={item.nik}>
                    <TableCell className="font-medium">{item.nik}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>
                      {item.photoMasuk ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="p-0 border-0 bg-transparent h-auto w-auto rounded-md overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                              <Image
                                src={item.photoMasuk}
                                alt={`Foto Masuk ${item.nama}`}
                                width={64}
                                height={64}
                                className="object-cover w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 border-0">
                            <DialogHeader className="sr-only">
                              <DialogTitle>Foto Masuk: {item.nama}</DialogTitle>
                              <DialogDescription>
                                Foto selfie absensi masuk untuk karyawan {item.nama} pada tanggal {tanggalHariIni}.
                              </DialogDescription>
                            </DialogHeader>
                            <Image
                              src={item.photoMasuk}
                              alt={`Foto Masuk ${item.nama}`}
                              width={800}
                              height={600}
                              className="rounded-lg object-contain w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.absenMasuk ? (
                        new Date(item.absenMasuk).toLocaleTimeString('id-ID')
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
                    <TableCell>
                      {item.photoPulang ? (
                        <Dialog>
                          <DialogTrigger asChild>
                             <button className="p-0 border-0 bg-transparent h-auto w-auto rounded-md overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Image
                                  src={item.photoPulang}
                                  alt={`Foto Pulang ${item.nama}`}
                                  width={64}
                                  height={64}
                                  className="object-cover w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                                />
                             </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 border-0">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Foto Pulang: {item.nama}</DialogTitle>
                                <DialogDescription>
                                  Foto selfie absensi pulang untuk karyawan {item.nama} pada tanggal {tanggalHariIni}.
                                </DialogDescription>
                            </DialogHeader>
                            <Image
                              src={item.photoPulang}
                              alt={`Foto Pulang ${item.nama}`}
                              width={800}
                              height={600}
                              className="rounded-lg object-contain w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.absenPulang ? (
                        new Date(item.absenPulang).toLocaleTimeString('id-ID')
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
            <p>Belum ada data absensi untuk hari ini di lokasi Anda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
