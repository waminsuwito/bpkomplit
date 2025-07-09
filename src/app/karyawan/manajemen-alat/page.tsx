
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, List, CheckSquare, XSquare, CheckCircle2, AlertTriangle, Wrench, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { userLocations } from '@/lib/types';
import { printElement } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Dummy data based on the screenshot and some additions
const dummyReports = [
  { id: 1, operator: 'Andi Saputra', kendaraan: 'TM-01 (BM 1234 ABC)', lokasi: 'BP PEKANBARU', status: 'Perlu Perhatian', waktu: '10:15' },
  { id: 2, operator: 'Budi Santoso', kendaraan: 'TM-05 (BM 5678 DEF)', lokasi: 'BP DUMAI', status: 'Rusak', waktu: '09:30' },
  { id: 3, operator: 'Citra Lestari', kendaraan: 'TM-02 (BM 9101 GHI)', lokasi: 'BP PEKANBARU', status: 'Rusak', waktu: '08:45' },
  { id: 4, operator: 'Doni Firmansyah', kendaraan: 'TM-03 (BM 1122 JKL)', lokasi: 'BP BAUNG', status: 'Baik', waktu: '08:00' },
  { id: 5, operator: 'Eka Wijaya', kendaraan: 'TM-04 (BM 3344 MNO)', lokasi: 'BP IKN', status: 'Baik', waktu: '07:55' },
  { id: 6, operator: 'Fajar Nugraha', kendaraan: 'TM-06 (BM 5566 PQR)', lokasi: 'BP PEKANBARU', status: 'Baik', waktu: '07:45' },
];

const StatCard = ({ title, value, description, icon: Icon }: { title: string; value: string | number; description: string; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function ManajemenAlatPage() {
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi BP');

  const filteredData = useMemo(() => {
    const allReports = dummyReports;
    if (selectedLocation === 'Semua Lokasi BP') {
      return {
        totalAlat: 32,
        sudahChecklist: allReports.length,
        belumChecklist: 32 - allReports.length,
        alatBaik: allReports.filter(r => r.status === 'Baik').length,
        perluPerhatian: allReports.filter(r => r.status === 'Perlu Perhatian').length,
        alatRusak: allReports.filter(r => r.status === 'Rusak').length,
        laporanTerbaru: allReports,
      };
    }
    
    const laporanLokasi = allReports.filter(r => r.lokasi === selectedLocation);
    const totalAlatLokasi = Math.floor(32 / userLocations.length) + (laporanLokasi.length % 2); // Dummy total for location

    return {
      totalAlat: totalAlatLokasi,
      sudahChecklist: laporanLokasi.length,
      belumChecklist: totalAlatLokasi - laporanLokasi.length,
      alatBaik: laporanLokasi.filter(r => r.status === 'Baik').length,
      perluPerhatian: laporanLokasi.filter(r => r.status === 'Perlu Perhatian').length,
      alatRusak: laporanLokasi.filter(r => r.status === 'Rusak').length,
      laporanTerbaru: laporanLokasi,
    };
  }, [selectedLocation]);
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Baik':
        return 'default';
      case 'Perlu Perhatian':
        return 'secondary';
      case 'Rusak':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="space-y-6" id="manajemen-alat-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => printElement('manajemen-alat-content')}>
            <Printer className="mr-2 h-4 w-4" /> Print Laporan
          </Button>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Pilih Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua Lokasi BP">Semua Lokasi BP</SelectItem>
              {userLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Alat" value={filteredData.totalAlat} description="Total alat di lokasi ini" icon={Package} />
        <StatCard title="Alat Sudah Checklist" value={filteredData.sudahChecklist} description="Alat yang sudah dicek hari ini" icon={CheckSquare} />
        <StatCard title="Alat Belum Checklist" value={filteredData.belumChecklist} description="Alat yang belum dicek hari ini" icon={XSquare} />
        <StatCard title="Alat Baik" value={filteredData.alatBaik} description="Total alat kondisi baik" icon={CheckCircle2} />
        <StatCard title="Perlu Perhatian" value={filteredData.perluPerhatian} description="Total alat perlu perhatian" icon={AlertTriangle} />
        <StatCard title="Alat Rusak" value={filteredData.alatRusak} description="Total alat kondisi rusak" icon={Wrench} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru Hari Ini</CardTitle>
          <CardDescription>
            Checklist yang baru saja dikirim oleh operator di lokasi yang dipilih hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu Lapor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.laporanTerbaru.length > 0 ? (
                  filteredData.laporanTerbaru.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.operator}</TableCell>
                      <TableCell>{report.kendaraan}</TableCell>
                      <TableCell>{report.lokasi}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(report.status)}
                          className={cn({
                            'bg-green-600 hover:bg-green-700': report.status === 'Baik',
                            'bg-amber-500 hover:bg-amber-600': report.status === 'Perlu Perhatian',
                          })}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.waktu}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada laporan untuk lokasi ini hari ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
