

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CheckSquare, XSquare, CheckCircle2, AlertTriangle, Wrench, Package, Building, Eye, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type TruckChecklistReport, type TruckChecklistItem, type UserLocation, type Vehicle } from '@/lib/types';
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

const VEHICLES_STORAGE_KEY_PREFIX = 'app-vehicles-';

const getVehiclesForLocation = (location: UserLocation): Vehicle[] => {
    try {
        const key = `${VEHICLES_STORAGE_KEY_PREFIX}${location}`;
        const storedVehicles = localStorage.getItem(key);
        return storedVehicles ? JSON.parse(storedVehicles) : [];
    } catch (error) {
        console.error(`Failed to load vehicles for ${location}:`, error);
        return [];
    }
}

interface Report {
  id: string | number;
  operator: string;
  kendaraan: string;
  lokasi: UserLocation | 'N/A';
  status: 'Baik' | 'Perlu Perhatian' | 'Rusak' | 'Belum Checklist';
  waktu: string;
  items?: TruckChecklistItem[];
  isHeavilyDamaged?: boolean;
}


const StatCard = ({ title, value, description, icon: Icon, onClick, clickable, colorClass, asLink, href }: { title: string; value: string | number; description: string; icon: React.ElementType, onClick?: () => void, clickable?: boolean, colorClass?: string, asLink?: boolean, href?: string }) => {
    const cardContent = (
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

    if (asLink && href) {
        return <Link href={href}>{cardContent}</Link>;
    }
    
    return cardContent;
};

export default function ManajemenAlatPage() {
  const { user } = useAuth();
  const [dialogContent, setDialogContent] = useState<{ title: string; reports: Report[] } | null>(null);
  const [detailReport, setDetailReport] = useState<Report | null>(null);
  
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!user?.location) return;

    const loadData = () => {
        const vehicles = getVehiclesForLocation(user.location as UserLocation);
        setAllVehicles(vehicles);
    }
    
    loadData();

    // Listen for storage changes to update the view in real-time
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [user]);

  const filteredData = useMemo(() => {
    if (!user?.location) {
      return { totalAlat: 0, sudahChecklistReports: [], belumChecklistReports: [], alatBaik: [], perluPerhatian: [], alatRusak: [], alatRusakBerat: 0 };
    }

    const alatBaik = allVehicles.filter(v => v.status === 'BAIK');
    const perluPerhatian = allVehicles.filter(v => v.status === 'PERLU PERHATIAN');
    const alatRusak = allVehicles.filter(v => v.status === 'RUSAK');
    const alatRusakBerat = allVehicles.filter(v => v.status === 'RUSAK BERAT');

    return {
      totalAlat: allVehicles.length,
      alatBaik,
      perluPerhatian,
      alatRusak,
      alatRusakBerat: alatRusakBerat.length,
      // The logic for 'checklist' status is no longer relevant with the new vehicle management system.
      // These are kept as empty arrays to prevent breaking the dialog logic.
      sudahChecklistReports: [],
      belumChecklistReports: [],
    };
  }, [user, allVehicles]);
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'BAIK': return 'default';
      case 'PERLU PERHATIAN': return 'secondary';
      case 'RUSAK': return 'destructive';
      case 'RUSAK BERAT': return 'destructive';
      default: return 'outline';
    }
  };

  // This function is kept for potential future use but is simplified.
  const handleCardClick = (type: 'Baik' | 'Perlu Perhatian' | 'Rusak' | 'Total') => {
      // In a real implementation, this would show a dialog with the filtered vehicles.
      // For now, it's a placeholder.
      toast({ title: `Menampilkan Alat: ${type}`, description: "Fungsi dialog rincian sedang dikembangkan." });
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Alat" value={filteredData.totalAlat} description="Jumlah semua armada terdaftar" icon={Package} />
        <StatCard title="Alat Baik" value={filteredData.alatBaik.length} description="Armada dalam kondisi operasional" icon={CheckCircle2} colorClass="text-green-600" />
        <StatCard title="Perlu Perhatian" value={filteredData.perluPerhatian.length} description="Armada dengan catatan minor" icon={AlertTriangle} colorClass="text-amber-500" />
        <StatCard title="Alat Rusak" value={filteredData.alatRusak.length} description="Armada yang membutuhkan perbaikan" icon={Wrench} colorClass="text-destructive" />
        {(user?.jabatan === 'KEPALA WORKSHOP' || user?.jabatan === 'KEPALA MEKANIK') && (
             <StatCard 
                title="Alat Rusak Berat" 
                value={filteredData.alatRusakBerat} 
                description="Klik untuk mengelola" 
                icon={ShieldAlert} 
                clickable 
                asLink
                href="/karyawan/alat-rusak-berat"
                colorClass="text-destructive font-black" />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Status Armada</CardTitle>
          <CardDescription>
            Daftar semua armada dan status terakhirnya di lokasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Lambung</TableHead>
                  <TableHead>No. Polisi</TableHead>
                  <TableHead>Jenis Kendaraan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allVehicles.length > 0 ? (
                  allVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.nomorLambung}</TableCell>
                      <TableCell>{vehicle.nomorPolisi}</TableCell>
                      <TableCell>{vehicle.jenisKendaraan}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(vehicle.status)}
                          className={cn({
                            'bg-green-600 hover:bg-green-700 text-white': vehicle.status === 'BAIK',
                            'bg-amber-500 hover:bg-amber-600 text-white': vehicle.status === 'PERLU PERHATIAN',
                            'font-bold': vehicle.status === 'RUSAK BERAT'
                          })}
                        >
                          {vehicle.status || 'TIDAK DIKETAHUI'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada data armada untuk lokasi Anda.
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
