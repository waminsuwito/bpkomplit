
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CheckSquare, XSquare, CheckCircle2, AlertTriangle, Wrench, Package, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type TruckChecklistReport, type TruckChecklistItem, type UserLocation } from '@/lib/types';
import { printElement } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getUsers } from '@/lib/auth';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-provider';


const TM_CHECKLIST_STORAGE_KEY = 'app-tm-checklists';
const LOADER_CHECKLIST_STORAGE_KEY = 'app-loader-checklists';

interface Report {
  id: string | number;
  operator: string;
  kendaraan: string;
  lokasi: UserLocation | 'N/A';
  status: 'Baik' | 'Perlu Perhatian' | 'Rusak' | 'Belum Checklist';
  waktu: string;
}


const StatCard = ({ title, value, description, icon: Icon, onClick, clickable, colorClass }: { title: string; value: string | number; description: string; icon: React.ElementType, onClick?: () => void, clickable?: boolean, colorClass?: string }) => (
  <Card onClick={onClick} className={cn(clickable && 'cursor-pointer transition-colors hover:bg-muted/50')}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={cn("text-2xl font-bold", colorClass)}>{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function ManajemenAlatPage() {
  const { user } = useAuth();
  const [dialogContent, setDialogContent] = useState<{ title: string; reports: Report[] } | null>(null);
  
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const [notSubmittedReports, setNotSubmittedReports] = useState<Report[]>([]);

  useEffect(() => {
    // 1. Get today's date string
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 2. Get all relevant users (operators)
    const allUsers = getUsers();
    const operatorUsers = allUsers.filter(u => 
        u.jabatan?.includes('SOPIR') || u.jabatan?.includes('OPRATOR')
    );
    
    // 3. Get all checklist reports from both sources
    const tmReportsStr = localStorage.getItem(TM_CHECKLIST_STORAGE_KEY);
    const loaderReportsStr = localStorage.getItem(LOADER_CHECKLIST_STORAGE_KEY);

    const allTmChecklists: TruckChecklistReport[] = tmReportsStr ? JSON.parse(tmReportsStr) : [];
    const allLoaderChecklists: TruckChecklistReport[] = loaderReportsStr ? JSON.parse(loaderReportsStr) : [];
    
    const allChecklists = [...allTmChecklists, ...allLoaderChecklists];

    // 4. Filter for today's reports only
    // Note: The loader checklist ID is now `userId-date`, not composite key
    const todaysChecklists = allChecklists.filter(report => report.id.includes(todayStr));

    // 5. Create a Set of user IDs who have submitted a report today for quick lookup
    const submittedUserIds = new Set(todaysChecklists.map(r => r.userId));

    // 6. Process the reports that were submitted today
    const processedSubmittedReports: Report[] = todaysChecklists.map(report => {
        const getOverallStatus = (items: TruckChecklistItem[]): 'Baik' | 'Rusak' | 'Perlu Perhatian' => {
            if (items.some(item => item.status === 'rusak')) return 'Rusak';
            if (items.some(item => item.status === 'perlu_perhatian')) return 'Perlu Perhatian';
            return 'Baik';
        };

        return {
            id: report.id,
            operator: report.username,
            kendaraan: `Kendaraan NIK: ${report.userNik}`, // Using NIK as vehicle identifier
            lokasi: report.location,
            status: getOverallStatus(report.items),
            waktu: format(new Date(report.timestamp), 'HH:mm'),
        };
    });
    setSubmittedReports(processedSubmittedReports);

    // 7. Identify users who have NOT submitted a report today
    const usersWhoDidNotSubmit = operatorUsers.filter(user => !submittedUserIds.has(user.id));
    const processedNotSubmittedReports: Report[] = usersWhoDidNotSubmit.map(user => ({
        id: user.id, // Use user ID as a unique key
        operator: user.username,
        kendaraan: `Kendaraan NIK: ${user.nik || 'N/A'}`,
        lokasi: user.location || 'N/A',
        status: 'Belum Checklist',
        waktu: '-',
    }));
    setNotSubmittedReports(processedNotSubmittedReports);

  }, []);


  const filteredData = useMemo(() => {
    if (!user?.location) {
      return { totalAlat: 0, sudahChecklistReports: [], belumChecklistReports: [], alatBaik: [], perluPerhatian: [], alatRusak: [] };
    }

    const sudah = submittedReports.filter(r => r.lokasi === user.location);
    const belum = notSubmittedReports.filter(r => r.lokasi === user.location);

    return {
      totalAlat: sudah.length + belum.length,
      sudahChecklistReports: sudah,
      belumChecklistReports: belum,
      alatBaik: sudah.filter(r => r.status === 'Baik'),
      perluPerhatian: sudah.filter(r => r.status === 'Perlu Perhatian'),
      alatRusak: sudah.filter(r => r.status === 'Rusak'),
    };
  }, [user, submittedReports, notSubmittedReports]);
  
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
        <div className="flex items-center gap-2 text-lg">
          <Building className="h-6 w-6 text-muted-foreground" />
          <span className="font-semibold">{user?.location || 'Memuat lokasi...'}</span>
        </div>
        <Button onClick={() => printElement('manajemen-alat-content')}>
          <Printer className="mr-2 h-4 w-4" /> Print Laporan
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Alat" value={filteredData.totalAlat} description="Klik untuk melihat rincian" icon={Package} clickable onClick={() => handleCardClick('Total')} />
        <StatCard title="Alat Sudah Checklist" value={filteredData.sudahChecklistReports.length} description="Klik untuk melihat rincian" icon={CheckSquare} clickable onClick={() => handleCardClick('Sudah Checklist')} />
        <StatCard title="Alat Belum Checklist" value={filteredData.belumChecklistReports.length} description="Klik untuk melihat rincian" icon={XSquare} clickable onClick={() => handleCardClick('Belum Checklist')} />
        <StatCard title="Alat Baik" value={filteredData.alatBaik.length} description="Klik untuk melihat rincian" icon={CheckCircle2} clickable onClick={() => handleCardClick('Baik')} colorClass="text-green-600" />
        <StatCard title="Perlu Perhatian" value={filteredData.perluPerhatian.length} description="Klik untuk melihat rincian" icon={AlertTriangle} clickable onClick={() => handleCardClick('Perlu Perhatian')} colorClass="text-amber-500" />
        <StatCard title="Alat Rusak" value={filteredData.alatRusak.length} description="Klik untuk melihat rincian" icon={Wrench} clickable onClick={() => handleCardClick('Rusak')} colorClass="text-destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru Hari Ini</CardTitle>
          <CardDescription>
            Checklist yang baru saja dikirim oleh operator di lokasi Anda hari ini.
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
                            'bg-green-600 hover:bg-green-700 text-white': report.status === 'Baik',
                            'bg-amber-500 hover:bg-amber-600 text-white': report.status === 'Perlu Perhatian',
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
                      Tidak ada laporan untuk lokasi Anda hari ini.
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
              Menampilkan daftar rinci alat berdasarkan status yang dipilih untuk lokasi Anda: {user?.location}.
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
                            'bg-green-600 hover:bg-green-700 text-white': report.status === 'Baik',
                            'bg-amber-500 hover:bg-amber-600 text-white': report.status === 'Perlu Perhatian',
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
