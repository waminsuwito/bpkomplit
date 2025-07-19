
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/auth-provider';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Package, Users, Truck, Beaker, HardHat } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userLocations } from '@/lib/types';
import { Label } from '@/components/ui/label';


const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType, children: React.ReactNode }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-lg text-primary">
        <Icon className="h-6 w-6" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const DataRow = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-none">
    <p className="text-sm font-medium">{label}</p>
    <p className="text-sm font-mono font-semibold">{value} <span className="text-muted-foreground">{unit}</span></p>
  </div>
);

const ArmadaTable = ({ data }: { data: { name: string, baik: number, rusak: number, tanpaSopir: number }[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Armada</TableHead>
                <TableHead className="text-center">Baik</TableHead>
                <TableHead className="text-center">Rusak</TableHead>
                <TableHead className="text-center">Tanpa Sopir</TableHead>
                <TableHead className="text-center">Total</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map(item => (
                <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center font-mono">{item.baik}</TableCell>
                    <TableCell className="text-center font-mono">{item.rusak}</TableCell>
                    <TableCell className="text-center font-mono">{item.tanpaSopir}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{item.baik + item.rusak + item.tanpaSopir}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [selectedLocation, setSelectedLocation] = useState(user?.location || userLocations[0]);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dummyArmadaData = [
        { name: 'TM', baik: 10, rusak: 2, tanpaSopir: 1 },
        { name: 'DT', baik: 5, rusak: 0, tanpaSopir: 0 },
        { name: 'LOADER', baik: 2, rusak: 0, tanpaSopir: 0 },
        { name: 'CP', baik: 1, rusak: 1, tanpaSopir: 0 },
        { name: 'KT', baik: 3, rusak: 0, tanpaSopir: 0 },
        { name: 'EXA', baik: 1, rusak: 0, tanpaSopir: 0 },
        { name: 'INVENTARIS', baik: 4, rusak: 0, tanpaSopir: 0 },
        { name: 'FOCO', baik: 1, rusak: 0, tanpaSopir: 0 },
        { name: 'DUTRO', baik: 2, rusak: 0, tanpaSopir: 0 },
        { name: 'FORKLIFT', baik: 1, rusak: 0, tanpaSopir: 0 },
        { name: 'GENSET', baik: 1, rusak: 0, tanpaSopir: 0 },
    ];
    
  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm">
                <div className="font-semibold">
                    TANGGAL: {format(currentDateTime, 'd MMMM yyyy, HH:mm:ss', { locale: id })}
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="location-select">LOKASI:</Label>
                    <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value as typeof selectedLocation)}>
                        <SelectTrigger id="location-select" className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {userLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Pengecoran" icon={BarChart}>
                <DataRow label="Schedule Cor" value={10} />
                <DataRow label="Penambahan" value={2} />
                <DataRow label="Terkirim" value={8} unit="M³"/>
                <DataRow label="Sisa" value={4} unit="M³"/>
            </SectionCard>
            
            <SectionCard title="Stok Material Saat Ini" icon={Package}>
                <DataRow label="Semen" value={50000} unit="Kg" />
                <DataRow label="Pasir" value={1200} unit="Ton" />
                <DataRow label="Batu" value={1500} unit="Ton" />
                <DataRow label="VZ" value={100} unit="L" />
                <DataRow label="NN" value={80} unit="L" />
                <DataRow label="Visco" value={120} unit="L" />
            </SectionCard>

            <SectionCard title="Man Power Hari Ini" icon={Users}>
                <DataRow label="Masuk" value={45} />
                <DataRow label="Ijin" value={2} />
                <DataRow label="Sakit" value={1} />
                <DataRow label="Alpha" value={0} />
                <DataRow label="Total" value={48} />
            </SectionCard>

            <SectionCard title="Material Masuk Sampai Saat Ini" icon={Package}>
                <DataRow label="Semen" value={10000} unit="Kg" />
                <DataRow label="Pasir" value={500} unit="Ton" />
                <DataRow label="Batu" value={400} unit="Ton" />
                <DataRow label="VZ" value={0} unit="L" />
                <DataRow label="NN" value={0} unit="L" />
                <DataRow label="Visco" value={0} unit="L" />
            </SectionCard>
            
            <SectionCard title="List Pekerjaan Mekanik" icon={HardHat}>
                 <DataRow label="Menunggu" value={2} />
                 <DataRow label="Dikerjakan" value={3} />
                 <DataRow label="Selesai Hari Ini" value={5} />
            </SectionCard>
            
            <SectionCard title="QC Monitoring" icon={Beaker}>
                 <DataRow label="Suhu Air" value={28} unit="°C" />
                 <DataRow label="pH Air" value={7.2} />
                 <DataRow label="TDS Air" value={150} unit="ppm" />
                 <DataRow label="Check Slump" value={12} unit="cm" />
                 <DataRow label="Jumlah Sample" value={5} />
            </SectionCard>
        </div>

        <SectionCard title="Armada" icon={Truck}>
            <ArmadaTable data={dummyArmadaData} />
        </SectionCard>
    </div>
  );
}
