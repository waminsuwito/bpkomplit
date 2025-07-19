
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldX } from 'lucide-react';
import type { TruckChecklistReport } from '@/lib/types';
import Link from 'next/link';
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


const TM_CHECKLIST_STORAGE_KEY = 'app-tm-checklists';
const LOADER_CHECKLIST_STORAGE_KEY = 'app-loader-checklists';
const HEAVY_DAMAGE_STORAGE_KEY = 'app-heavy-damage-vehicles';

interface HeavyDamageVehicle {
  id: string | number;
  nomorLambung: string;
  nomorPolisi: string;
  jenisKendaraan: string;
  statusAlat: 'Rusak Berat';
}

export default function AlatRusakBeratPage() {
  const [vehicles, setVehicles] = useState<HeavyDamageVehicle[]>([]);
  const { toast } = useToast();

  const loadHeavyDamageVehicles = () => {
    try {
      const storedHeavyDamage = localStorage.getItem(HEAVY_DAMAGE_STORAGE_KEY);
      const heavyDamageIds: Set<string|number> = storedHeavyDamage ? new Set(JSON.parse(storedHeavyDamage)) : new Set();
      
      const tmReportsStr = localStorage.getItem(TM_CHECKLIST_STORAGE_KEY);
      const loaderReportsStr = localStorage.getItem(LOADER_CHECKLIST_STORAGE_KEY);
      const allTmChecklists: TruckChecklistReport[] = tmReportsStr ? JSON.parse(tmReportsStr) : [];
      const allLoaderChecklists: TruckChecklistReport[] = loaderReportsStr ? JSON.parse(loaderReportsStr) : [];
      const allChecklists = [...allTmChecklists, ...allLoaderChecklists];

      const heavyDamageVehicles = allChecklists
        .filter(report => heavyDamageIds.has(report.id))
        .map(report => ({
          id: report.id,
          // Placeholder data until we have a central vehicle list
          nomorLambung: `NL-${report.userNik.slice(-4)}`,
          nomorPolisi: 'N/A',
          jenisKendaraan: report.id.startsWith('tm-') ? 'Truck Mixer' : 'Wheel Loader',
          statusAlat: 'Rusak Berat' as const,
        }));
      
      setVehicles(heavyDamageVehicles);
    } catch (error) {
      console.error("Failed to load heavily damaged vehicles:", error);
      toast({ variant: 'destructive', title: 'Gagal Memuat Data', description: 'Tidak bisa memuat data alat rusak berat.' });
    }
  };

  useEffect(() => {
    loadHeavyDamageVehicles();
  }, []);

  const handleReleaseVehicle = (vehicleId: string | number) => {
    try {
      const storedHeavyDamage = localStorage.getItem(HEAVY_DAMAGE_STORAGE_KEY);
      let heavyDamageIds: (string|number)[] = storedHeavyDamage ? JSON.parse(storedHeavyDamage) : [];
      
      const updatedIds = heavyDamageIds.filter(id => id !== vehicleId);
      localStorage.setItem(HEAVY_DAMAGE_STORAGE_KEY, JSON.stringify(updatedIds));
      
      loadHeavyDamageVehicles(); // Reload the list
      
      toast({
        title: 'Alat Dikeluarkan',
        description: 'Alat telah dikeluarkan dari daftar rusak berat dan akan muncul di pemantauan normal.',
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal mengeluarkan alat dari daftar.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daftar Alat dengan Kerusakan Berat</CardTitle>
          <Button asChild variant="outline">
            <Link href="/karyawan/manajemen-alat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
        <CardDescription>
            Kelola daftar alat yang memerlukan perhatian khusus atau perbaikan besar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOMOR LAMBUNG</TableHead>
                <TableHead>NOMOR POLISI</TableHead>
                <TableHead>JENIS KENDARAAN</TableHead>
                <TableHead>STATUS ALAT</TableHead>
                <TableHead className="text-center text-red-600 font-bold">KELUARKAN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.nomorLambung}</TableCell>
                    <TableCell>{vehicle.nomorPolisi}</TableCell>
                    <TableCell>{vehicle.jenisKendaraan}</TableCell>
                    <TableCell className="font-semibold text-destructive">{vehicle.statusAlat}</TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <ShieldX className="mr-2 h-4 w-4" />
                                Keluarkan
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Apakah Anda yakin ingin mengeluarkan alat ini dari daftar kerusakan berat? Alat ini akan kembali ke pemantauan normal.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReleaseVehicle(vehicle.id)}>
                                      Ya, Keluarkan
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    Tidak ada alat dalam daftar kerusakan berat saat ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
