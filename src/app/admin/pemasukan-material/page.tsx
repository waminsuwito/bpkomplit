'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackagePlus } from 'lucide-react';
import type { BongkarMaterial } from '@/lib/types';

const BONGKAR_MATERIAL_STORAGE_KEY = 'app-bongkar-material';

export default function PemasukanMaterialPage() {
  const [completedUnloads, setCompletedUnloads] = useState<BongkarMaterial[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(BONGKAR_MATERIAL_STORAGE_KEY);
      if (storedData) {
        const allUnloads: BongkarMaterial[] = JSON.parse(storedData);
        const finished = allUnloads.filter(item => item.status === 'Selesai');
        setCompletedUnloads(finished);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" />
            Ringkasan Pemasukan Material
          </CardTitle>
          <CardDescription>
            Menampilkan ringkasan material yang telah selesai dibongkar dan masuk ke gudang. Data ini diambil secara otomatis dari modul "Bongkar Material".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedUnloads.length > 0 ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waktu Selesai Bongkar</TableHead>
                            <TableHead>Nama Material</TableHead>
                            <TableHead>Kapal/Kendaraan</TableHead>
                            <TableHead>Nama Kapten/Sopir</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Keterangan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {completedUnloads.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.waktuSelesai ? new Date(item.waktuSelesai).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</TableCell>
                                <TableCell>{item.namaMaterial}</TableCell>
                                <TableCell>{item.kapalKendaraan}</TableCell>
                                <TableCell>{item.namaKaptenSopir}</TableCell>
                                <TableCell>{item.volume}</TableCell>
                                <TableCell>{item.keterangan}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>Belum ada data bongkar material yang selesai.</p>
              <p>Selesaikan proses di menu "Bongkar Material" untuk melihat ringkasannya di sini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
