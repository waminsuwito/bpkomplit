
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CheckSquare, XSquare, CheckCircle2, AlertTriangle, Wrench, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { userLocations } from '@/lib/types';
import { printElement } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Dummy data for tools that have reports
const dummyReports = [
  { id: 1, operator: 'Andi Saputra', kendaraan: 'TM-01 (BM 1234 ABC)', lokasi: 'BP PEKANBARU', status: 'Perlu Perhatian', waktu: '10:15' },
  { id: 2, operator: 'Budi Santoso', kendaraan: 'TM-05 (BM 5678 DEF)', lokasi: 'BP DUMAI', status: 'Rusak', waktu: '09:30' },
  { id: 3, operator: 'Citra Lestari', kendaraan: 'TM-02 (BM 9101 GHI)', lokasi: 'BP PEKANBARU', status: 'Rusak', waktu: '08:45' },
  { id: 4, operator: 'Doni Firmansyah', kendaraan: 'TM-03 (BM 1122 JKL)', lokasi: 'BP BAUNG', status: 'Baik', waktu: '08:00' },
  { id: 5, operator: 'Eka Wijaya', kendaraan: 'TM-04 (BM 3344 MNO)', lokasi: 'BP IKN', status: 'Baik', waktu: '07:55' },
  { id: 6, operator: 'Fajar Nugraha', kendaraan: 'TM-06 (BM 5566 PQR)', lokasi: 'BP PEKANBARU', status: 'Baik', waktu: '07:45' },
];

// Dummy data for tools that have NOT submitted a report yet
const dummyBelumChecklist = [
  { id: 101, operator: 'Gilang Ramadhan', kendaraan: 'TM-11 (BM 1111 GR)', lokasi: 'BP PEKANBARU', status: 'Belum Checklist', waktu: '-' },
  { id: 102, operator: 'Hani Fitria', kendaraan: 'TM-12 (BM 2222 HF)', lokasi: 'BP DUMAI', status: 'Belum Checklist', waktu: '-' },
  { id: 103, operator: 'Indra Jaya', kendaraan: 'TM-13 (BM 3333 IJ)', lokasi: 'BP BAUNG', status: 'Belum Checklist', waktu: '-' },
  { id: 104, operator: 'Joko Susilo', kendaraan: 'TM-14 (BM 4444 JS)', lokasi: 'BP IKN', status: 'Belum Checklist', waktu: '-' },
  { id: 105, operator: 'Kartika Sari', kendaraan: 'TM-15 (BM 5555 KS)', lokasi: 'BP PEKANBARU', status: 'Belum Checklist', waktu: '-' },
  { id: 106, operator: 'Lina Marlina', kendaraan: 'TM-16 (BM 6666 LM)', lokasi: 'BP DUMAI', status: 'Belum Checklist', waktu: '-' },
  { id: 107, operator: 'Mega Putri', kendaraan: 'WL-01 (BM 7777 MP)', lokasi: 'BP PEKANBARU', status: 'Belum Checklist', waktu: '-' },
  { id: 108, operator: 'Nanda Pratama', kendaraan: 'WL-02 (BM 8888 NP)', lokasi: 'BP DUMAI', status: 'Belum Checklist', waktu: '-' },
];


type Report = typeof dummyReports[0];

const StatCard = ({ title, value, description, icon: Icon, onClick, clickable }: { title: string; value: string | number; description: string; icon: React.ElementType, onClick?: () => void, clickable?: boolean }) => (
  <Card onClick={onClick} className={cn(clickable && 'cursor-pointer transition-colors hover:bg-muted/50')}>
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
  const [dialogContent, setDialogContent] = useState<{ title: string; reports: Report[] } | null>(null);

  const filteredData = useMemo(() => {
    if (selectedLocation === 'Semua Lokasi BP') {
      return {
        totalAlat: dummyReports.length + dummyBelumChecklist.length,
        sudahChecklistReports: dummyReports,
        belumChecklistReports: dummyBelumChecklist,
        alatBaik: dummyReports.filter(r => r.status === 'Baik'),
        perluPerhatian: dummyReports.filter(r => r.status === 'Perlu Perhatian'),
        alatRusak: dummyReports.filter(r => r.status === 'Rusak'),
      };
    }
    
    const sudah = dummyReports.filter(r => r.lokasi === selectedLocation);
    const belum = dummyBelumChecklist.filter(r => r.lokasi === selectedLocation);

    return {
      totalAlat: sudah.length + belum.length,
      sudahChecklistReports: sudah,
      belumChecklistReports: belum,
      alatBaik: sudah.filter(r => r.status === 'Baik'),
      perluPerhatian: sudah.filter(r => r.status === 'Perlu Perhatian'),
      alatRusak: sudah.filter(r => r.status === 'Rusak'),
    };
  }, [selectedLocation]);
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Baik': return 'default';
      case 'Perlu Perhatian': return 'secondary';
      case 'Rusak': return 'destructive';
      case 'Belum Checklist': return 'outline';
      default: return 'outline';
    }
  };

  const handleCardClick = (type: 'Baik' | 'Perlu Perhatian' | 'Rusak' | 'Sudah Checklist' | 'Belum Checklist' | 'Total') => {
    const titleMap = {
      'Total': 'Daftar Semua Alat',
      'Sudah Checklist': 'Daftar Alat Sudah Checklist',
      'Belum Checklist': 'Daftar Alat Belum Checklist',
      'Baik': 'Daftar Alat Kondisi Baik',
      'Perlu Perhatian': 'Daftar Alat Perlu Perhatian',
      'Rusak': 'Daftar Alat Kondisi Rusak',
    };
    
    let reportsToShow: Report[] = [];
    switch(type) {
        case 'Total':
            reportsToShow = [...filteredData.sudahChecklistReports, ...filteredData.belumChecklistReports];
            break;
        case 'Sudah Checklist':
            reportsToShow = filteredData.sudahChecklistReports;
            break;
        case 'Belum Checklist':
            reportsToShow = filteredData.belumChecklistReports;
            break;
        case 'Baik':
            reportsToShow = filteredData.alatBaik;
            break;
        case 'Perlu Perhatian':
            reportsToShow = filteredData.perluPerhatian;
            break;
        case 'Rusak':
            reportsToShow = filteredData.alatRusak;
            break;
    }
      
    setDialogContent({ title: titleMap[type], reports: reportsToShow.sort((a,b) => a.kendaraan.localeCompare(b.kendaraan)) });
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
        <StatCard title="Total Alat" value={filteredData.totalAlat} description="Klik untuk melihat rincian" icon={Package} clickable onClick={() => handleCardClick('Total')} />
        <StatCard title="Alat Sudah Checklist" value={filteredData.sudahChecklistReports.length} description="Klik untuk melihat rincian" icon={CheckSquare} clickable onClick={() => handleCardClick('Sudah Checklist')} />
        <StatCard title="Alat Belum Checklist" value={filteredData.belumChecklistReports.length} description="Klik untuk melihat rincian" icon={XSquare} clickable onClick={() => handleCardClick('Belum Checklist')} />
        <StatCard title="Alat Baik" value={filteredData.alatBaik.length} description="Klik untuk melihat rincian" icon={CheckCircle2} clickable onClick={() => handleCardClick('Baik')} />
        <StatCard title="Perlu Perhatian" value={filteredData.perluPerhatian.length} description="Klik untuk melihat rincian" icon={AlertTriangle} clickable onClick={() => handleCardClick('Perlu Perhatian')} />
        <StatCard title="Alat Rusak" value={filteredData.alatRusak.length} description="Klik untuk melihat rincian" icon={Wrench} clickable onClick={() => handleCardClick('Rusak')} />
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
                {filteredData.sudahChecklistReports.length > 0 ? (
                  filteredData.sudahChecklistReports.map((report) => (
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

      <Dialog open={!!dialogContent} onOpenChange={(open) => !open && setDialogContent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>
              Menampilkan daftar rinci alat berdasarkan status yang dipilih untuk lokasi: {selectedLocation}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4">
            {dialogContent?.reports && dialogContent.reports.length > 0 ? (
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
                  {dialogContent.reports.map((report) => (
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Tidak ada data untuk ditampilkan.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
