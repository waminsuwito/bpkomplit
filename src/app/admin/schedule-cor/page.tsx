
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { CalendarCheck, PlusCircle, Trash2, Calendar as CalendarIcon, Printer } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Schedule } from '@/lib/types';
import { getSchedules, saveSchedules } from '@/lib/schedule';
import { cn, printElement } from '@/lib/utils';


const initialFormState = {
  customerName: '',
  projectLocation: '',
  concreteQuality: '',
  slump: '',
  volume: '',
  mediaCor: 'CP' as const,
};

export default function ScheduleCorPage() {
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [formState, setFormState] = useState<Omit<Schedule, 'id' | 'date'>>(initialFormState);

  useEffect(() => {
    setAllSchedules(getSchedules());
  }, []);

  const todaysSchedules = allSchedules.filter(
    (s) => s.date === format(date, 'yyyy-MM-dd')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleMediaCorChange = (value: 'CP' | 'Manual') => {
    setFormState(prev => ({...prev, mediaCor: value}));
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formState.customerName.trim() ||
      !formState.projectLocation.trim() ||
      !formState.concreteQuality.trim() ||
      !formState.slump.trim() ||
      !formState.volume.trim()
    ) {
      alert('Semua kolom harus diisi.');
      return;
    }
    const newSchedule: Schedule = {
      id: new Date().toISOString(),
      ...formState,
      date: format(date, 'yyyy-MM-dd'),
    };
    const updatedSchedules = [...allSchedules, newSchedule];
    setAllSchedules(updatedSchedules);
    saveSchedules(updatedSchedules);
    setFormState(initialFormState); // Reset form
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = allSchedules.filter(schedule => schedule.id !== id);
    setAllSchedules(updatedSchedules);
    saveSchedules(updatedSchedules);
  };

  return (
    <div className="space-y-6">
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Tambah Jadwal Pengecoran Baru
          </CardTitle>
          <CardDescription>
            Pilih tanggal lalu masukkan detail jadwal pengecoran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
             <div className="space-y-2 lg:col-span-4">
              <Label htmlFor="schedule-date">Tanggal Jadwal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[280px] justify-start text-left font-normal',
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
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formState.customerName}
                onChange={handleInputChange}
                placeholder="Contoh: PT. Abadi Jaya"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectLocation">Lokasi Proyek</Label>
              <Input
                id="projectLocation"
                name="projectLocation"
                value={formState.projectLocation}
                onChange={handleInputChange}
                placeholder="Contoh: Jl. Sudirman No. 123"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concreteQuality">Mutu Beton</Label>
              <Input
                id="concreteQuality"
                name="concreteQuality"
                value={formState.concreteQuality}
                onChange={handleInputChange}
                placeholder="Contoh: K-225"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slump">Slump (cm)</Label>
              <Input
                id="slump"
                name="slump"
                type="number"
                value={formState.slump}
                onChange={handleInputChange}
                placeholder="Contoh: 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (M³)</Label>
              <Input
                id="volume"
                name="volume"
                type="number"
                step="0.1"
                value={formState.volume}
                onChange={handleInputChange}
                placeholder="Contoh: 7.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mediaCor">Media Cor</Label>
              <Select
                name="mediaCor"
                value={formState.mediaCor}
                onValueChange={handleMediaCorChange}
              >
                <SelectTrigger id="mediaCor">
                  <SelectValue placeholder="Pilih media cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CP">CP</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-4 flex justify-end items-end">
              <Button type="submit">Tambah Jadwal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card id="print-content">
        <CardHeader>
          <div className="flex justify-between items-center no-print">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-6 w-6 text-primary" />
                Daftar Schedule Cor untuk {date ? format(date, 'd MMMM yyyy') : '...' }
              </CardTitle>
              <CardDescription>
                Lihat dan kelola semua jadwal pengecoran untuk tanggal yang dipilih.
              </CardDescription>
            </div>
            <Button onClick={() => printElement('print-content')}>
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </div>
          <div className="print-only mb-6 text-center">
            <h1 className="text-xl font-bold">Daftar Schedule Cor</h1>
            <p className="text-sm">Tanggal: {date ? format(date, 'd MMMM yyyy') : '...'}</p>
          </div>
        </CardHeader>
        <CardContent>
          {todaysSchedules.length > 0 ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Pelanggan</TableHead>
                            <TableHead>Lokasi Proyek</TableHead>
                            <TableHead>Mutu Beton</TableHead>
                            <TableHead>Slump (cm)</TableHead>
                            <TableHead>Volume (M³)</TableHead>
                            <TableHead>Media Cor</TableHead>
                            <TableHead className="text-center no-print">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {todaysSchedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell>{schedule.customerName}</TableCell>
                                <TableCell>{schedule.projectLocation}</TableCell>
                                <TableCell>{schedule.concreteQuality}</TableCell>
                                <TableCell>{schedule.slump}</TableCell>
                                <TableCell>{schedule.volume}</TableCell>
                                <TableCell>{schedule.mediaCor}</TableCell>
                                <TableCell className="text-center no-print">
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteSchedule(schedule.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Hapus</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>Belum ada jadwal yang ditambahkan untuk tanggal ini.</p>
              <p>Gunakan formulir di atas untuk menambahkan jadwal baru.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
