
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Users, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const KARYAWAN_STORAGE_KEY = 'app-karyawan-reports';

interface KaryawanReport {
  id: string; // Will use date as ID YYYY-MM-DD
  date: string;
  totalKaryawan: number;
  karyawanMasuk: number;
  sakit: number;
  ijin: number;
  alpha: number;
}

const initialFormState = {
  totalKaryawan: 0,
  karyawanMasuk: 0,
  sakit: 0,
  ijin: 0,
  alpha: 0,
};

export default function ManajemenKaryawanPage() {
  const [reports, setReports] = useState<KaryawanReport[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [formState, setFormState] = useState(initialFormState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(KARYAWAN_STORAGE_KEY);
      if (storedData) {
        setReports(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // When date changes, load the data for that date into the form
  useEffect(() => {
    const dateString = format(date, 'yyyy-MM-dd');
    const existingReport = reports.find(r => r.date === dateString);
    if (existingReport) {
      setFormState({
        totalKaryawan: existingReport.totalKaryawan,
        karyawanMasuk: existingReport.karyawanMasuk,
        sakit: existingReport.sakit,
        ijin: existingReport.ijin,
        alpha: existingReport.alpha,
      });
    } else {
      setFormState(initialFormState);
    }
  }, [date, reports]);

  const saveToLocalStorage = (data: KaryawanReport[]) => {
    try {
      localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: Number(value) >= 0 ? Number(value) : 0 }));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();

    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check for negative numbers
    for (const key in formState) {
        if (formState[key as keyof typeof formState] < 0) {
            toast({ variant: 'destructive', title: 'Invalid Input', description: 'Values cannot be negative.' });
            return;
        }
    }

    const newReport: KaryawanReport = {
      id: dateString,
      date: dateString,
      ...formState,
    };

    let updatedReports;
    const existingReportIndex = reports.findIndex(r => r.id === dateString);

    if (existingReportIndex > -1) {
      // Update existing report
      updatedReports = [...reports];
      updatedReports[existingReportIndex] = newReport;
    } else {
      // Add new report and sort
      updatedReports = [...reports, newReport].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setReports(updatedReports);
    saveToLocalStorage(updatedReports);
    toast({ title: 'Report Saved', description: `Data for ${format(date, 'd MMMM yyyy')} has been saved.` });
  };
  
  const handleDeleteReport = (id: string) => {
    setReports(currentReports => {
        const updatedReports = currentReports.filter(r => r.id !== id);
        saveToLocalStorage(updatedReports);
        toast({ variant: 'destructive', title: 'Report Deleted', description: `Data for ${id} has been deleted.` });
        return updatedReports;
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Manajemen Karyawan
          </CardTitle>
          <CardDescription>
            Masukkan data absensi karyawan harian. Pilih tanggal untuk melihat atau mengedit data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveReport} className="space-y-4">
            <div className="space-y-2 max-w-xs">
               <Label>Tanggal Laporan</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalKaryawan">Total Karyawan</Label>
                <Input id="totalKaryawan" name="totalKaryawan" type="number" value={formState.totalKaryawan} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="karyawanMasuk">Karyawan Masuk</Label>
                <Input id="karyawanMasuk" name="karyawanMasuk" type="number" value={formState.karyawanMasuk} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sakit">Sakit</Label>
                <Input id="sakit" name="sakit" type="number" value={formState.sakit} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ijin">Ijin</Label>
                <Input id="ijin" name="ijin" type="number" value={formState.ijin} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alpha">Alpha</Label>
                <Input id="alpha" name="alpha" type="number" value={formState.alpha} onChange={handleInputChange} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Simpan Laporan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Laporan Absensi</CardTitle>
          <CardDescription>
            Daftar laporan absensi yang telah disimpan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">Total Karyawan</TableHead>
                    <TableHead className="text-center">Masuk</TableHead>
                    <TableHead className="text-center">Sakit</TableHead>
                    <TableHead className="text-center">Ijin</TableHead>
                    <TableHead className="text-center">Alpha</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{format(new Date(report.date), 'd MMMM yyyy')}</TableCell>
                      <TableCell className="text-center">{report.totalKaryawan}</TableCell>
                      <TableCell className="text-center">{report.karyawanMasuk}</TableCell>
                      <TableCell className="text-center">{report.sakit}</TableCell>
                      <TableCell className="text-center">{report.ijin}</TableCell>
                      <TableCell className="text-center">{report.alpha}</TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus laporan untuk tanggal {format(new Date(report.date), 'd MMMM yyyy')}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteReport(report.id)}>
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>Belum ada laporan absensi yang disimpan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    