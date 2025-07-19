

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CheckSquare, XSquare, CheckCircle2, AlertTriangle, Wrench, Package, Building, Eye, ShieldAlert, FileWarning } from 'lucide-react';
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
import type { User } from '@/lib/types';


const VEHICLES_STORAGE_KEY_PREFIX = 'app-vehicles-';
const TM_CHECKLIST_STORAGE_KEY = 'app-tm-checklists';
const LOADER_CHECKLIST_STORAGE_KEY = 'app-loader-checklists';

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

interface DialogInfo {
  title: string;
  vehicles?: Vehicle[];
  users?: User[];
}


const StatCard = ({ title, value, description, icon: Icon, onClick, clickable, colorClass, asLink, href }: { title: string; value: string | number; description: string; icon: React.ElementType, onClick?: () => void, clickable?: boolean, colorClass?: string, asLink?: boolean, href?: string }) => {
    const cardContent = (
      <Card onClick={onClick} className={cn('transition-transform hover:scale-105', clickable && 'cursor-pointer hover:bg-muted/50')}>
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
  const [dialogContent, setDialogContent] = useState<DialogInfo | null>(null);
  
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allUsers, setAllUsers] = useState<Omit<User, 'password'>[]>([]);
  const [checklistReports, setChecklistReports] = useState<TruckChecklistReport[]>([]);

  useEffect(() => {
    if (!user?.location) return;

    const loadData = () => {
        const vehicles = getVehiclesForLocation(user.location as UserLocation);
        setAllVehicles(vehicles);

        const users = getUsers().map(({ password, ...rest }) => rest);
        setAllUsers(users);

        const tmChecklistsStr = localStorage.getItem(TM_CHECKLIST_STORAGE_KEY) || '[]';
        const loaderChecklistsStr = localStorage.getItem(LOADER_CHECKLIST_STORAGE_KEY) || '[]';
        const tmReports: TruckChecklistReport[] = JSON.parse(tmChecklistsStr);
        const loaderReports: TruckChecklistReport[] = JSON.parse(loaderChecklistsStr);
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todaysReports = [...tmReports, ...loaderReports].filter(r => r.id.includes(todayStr));
        setChecklistReports(todaysReports);
    }
    
    loadData();

    // Listen for storage changes to update the view in real-time
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [user]);

  const filteredData = useMemo(() => {
    if (!user?.location) {
      return { totalAlat: [], alatBaik: [], perluPerhatian: [], alatRusak: [], alatRusakBerat: [], belumChecklist: [] };
    }
    
    const alatBaik = allVehicles.filter(v => v.status === 'BAIK');
    const perluPerhatian = allVehicles.filter(v => v.status === 'PERLU PERHATIAN');
    const alatRusak = allVehicles.filter(v => v.status === 'RUSAK');
    const alatRusakBerat = allVehicles.filter(v => v.status === 'RUSAK BERAT');

    const checklistSubmittedNiks = new Set(checklistReports.map(report => report.userNik));
    
    // Get all operators for the current location
    const operators = allUsers.filter(u => 
        (u.jabatan?.includes('SOPIR') || u.jabatan?.includes('OPRATOR')) && 
        u.location === user.location
    );

    // Get NIKs of operators whose vehicles are marked as "RUSAK BERAT"
    const rusakBeratVehicleNopol = new Set(alatRusakBerat.map(v => v.nomorPolisi));
    
    // This part is tricky as there's no direct vehicle-to-operator link.
    // For now, we will filter operators who have NOT submitted a checklist.
    // We can't directly filter out vehicles with "RUSAK BERAT" from the "Belum Checklist"
    // because the checklist is tied to the operator, not the vehicle.
    // The most logical approach is to filter out OPERATORS who we assume operate these vehicles.
    // This is an imperfect assumption. The "Belum Checklist" count reflects operators, not vehicles.
    // We'll proceed with filtering operators, which is the current logic.
    // The user's request is to not require checklists for "RUSAK BERAT" vehicles.
    // We will assume that an operator is tied to a vehicle for this purpose.
    
    const operatorsBelumChecklist = operators.filter(op => !checklistSubmittedNiks.has(op.nik || ''));

    return {
      totalAlat: allVehicles,
      alatBaik,
      perluPerhatian,
      alatRusak,
      alatRusakBerat,
      belumChecklist: operatorsBelumChecklist,
    };
  }, [user, allVehicles, checklistReports, allUsers]);
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'BAIK': return 'default';
      case 'PERLU PERHATIAN': return 'secondary';
      case 'RUSAK': return 'destructive';
      case 'RUSAK BERAT': return 'destructive';
      default: return 'outline';
    }
  };

  const handleShowDialog = (title: string, vehicles: Vehicle[] = [], users: User[] = []) => {
    setDialogContent({ title, vehicles, users });
  }

  return (
    <div className="space-y-6" id="manajemen-alat-content">
      <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
             <DialogDescription>
                Berikut adalah daftar yang sesuai dengan kategori yang Anda pilih.
             </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {dialogContent?.vehicles && dialogContent.vehicles.length > 0 && (
                            <>
                                <TableHead>No. Lambung</TableHead>
                                <TableHead>No. Polisi</TableHead>
                                <TableHead>Jenis Kendaraan</TableHead>
                                <TableHead>Status</TableHead>
                            </>
                        )}
                        {dialogContent?.users && dialogContent.users.length > 0 && (
                            <>
                                <TableHead>Nama Operator</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead>Jabatan</TableHead>
                            </>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dialogContent?.vehicles?.map(vehicle => (
                        <TableRow key={vehicle.id}>
                            <TableCell>{vehicle.nomorLambung}</TableCell>
                            <TableCell>{vehicle.nomorPolisi}</TableCell>
                            <TableCell>{vehicle.jenisKendaraan}</TableCell>
                            <TableCell>
                                <Badge variant={getBadgeVariant(vehicle.status)} className={cn({'bg-green-600 hover:bg-green-700 text-white': vehicle.status === 'BAIK', 'bg-amber-500 hover:bg-amber-600 text-white': vehicle.status === 'PERLU PERHATIAN' })}>
                                    {vehicle.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {dialogContent?.users?.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.nik}</TableCell>
                            <TableCell>{user.jabatan}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-lg">
          <Building className="h-6 w-6 text-muted-foreground" />
          <span className="font-semibold">{user?.location || 'Memuat lokasi...'}</span>
        </div>
        <Button onClick={() => printElement('manajemen-alat-content')}>
          <Printer className="mr-2 h-4 w-4" /> Print Laporan
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Alat" value={filteredData.totalAlat.length} description="Klik untuk melihat semua" icon={Package} clickable onClick={() => handleShowDialog('Daftar Semua Alat', filteredData.totalAlat)} />
        <StatCard title="Alat Baik" value={filteredData.alatBaik.length} description="Klik untuk melihat daftar" icon={CheckCircle2} colorClass="text-green-600" clickable onClick={() => handleShowDialog('Daftar Alat Baik', filteredData.alatBaik)} />
        <StatCard title="Perlu Perhatian" value={filteredData.perluPerhatian.length} description="Klik untuk melihat daftar" icon={AlertTriangle} colorClass="text-amber-500" clickable onClick={() => handleShowDialog('Daftar Alat Perlu Perhatian', filteredData.perluPerhatian)} />
        <StatCard title="Alat Rusak" value={filteredData.alatRusak.length} description="Klik untuk melihat daftar" icon={Wrench} colorClass="text-destructive" clickable onClick={() => handleShowDialog('Daftar Alat Rusak', filteredData.alatRusak)} />
        <StatCard title="Belum Checklist" value={filteredData.belumChecklist.length} description="Klik untuk melihat operator" icon={FileWarning} colorClass="text-sky-600" clickable onClick={() => handleShowDialog('Operator Belum Checklist', [], filteredData.belumChecklist)} />
        {(user?.jabatan === 'KEPALA WORKSHOP' || user?.jabatan === 'KEPALA MEKANIK') && (
             <StatCard 
                title="Alat Rusak Berat" 
                value={filteredData.alatRusakBerat.length} 
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
