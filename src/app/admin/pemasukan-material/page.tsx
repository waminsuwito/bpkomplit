'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PackagePlus, Calendar as CalendarIcon } from 'lucide-react';
import type { BongkarMaterial } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const BONGKAR_MATERIAL_STORAGE_KEY = 'app-bongkar-material';

export default function PemasukanMaterialPage() {
  const [completedUnloads, setCompletedUnloads] = useState<BongkarMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(BONGKAR_MATERIAL_STORAGE_KEY);
      if (storedData) {
        const allUnloads: BongkarMaterial[] = JSON.parse(storedData);
        const finished = allUnloads.filter(item => item.status === 'Selesai');
        setCompletedUnloads(finished);
      }
    } catch (error)      {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const materialOptions = useMemo(() => {
    const materials = new Set(completedUnloads.map(item => item.namaMaterial));
    return Array.from(materials);
  }, [completedUnloads]);

  const filteredUnloads = useMemo(() => {
    return completedUnloads.filter(item => {
      const isMaterialMatch = selectedMaterial ? item.namaMaterial === selectedMaterial : true;
      let isDateMatch = true;
      if (selectedDate && item.waktuSelesai) {
        try {
          const itemDate = new Date(item.waktuSelesai);
          isDateMatch = format(itemDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        } catch (e) {
          isDateMatch = false; // Invalid date in data
        }
      }
      return isMaterialMatch && isDateMatch;
    });
  }, [completedUnloads, selectedMaterial, selectedDate]);

  const handleResetFilters = () => {
    setSelectedMaterial('');
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" />
            Laporan Pemasukan Material
          </CardTitle>
          <CardDescription>
            Menampilkan laporan material yang telah selesai dibongkar. Gunakan filter untuk menyortir data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card-foreground/5">
            <div className="flex-1 space-y-2">
              <Label htmlFor="material-filter">Filter Berdasarkan Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger id="material-filter">
                  <SelectValue placeholder="Semua Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Material</SelectItem>
                  {materialOptions.map(material => (
                    <SelectItem key={material} value={material}>{material}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="date-filter">Filter Berdasarkan Tanggal Masuk</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button onClick={handleResetFilters} variant="ghost">Reset Filter</Button>
            </div>
          </div>

          {filteredUnloads.length > 0 ? (
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
                        {filteredUnloads.map((item) => (
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
              <p>Tidak ada data pemasukan material yang cocok dengan filter Anda.</p>
              <p>Coba reset filter atau selesaikan proses bongkar di menu "Bongkar Material".</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
