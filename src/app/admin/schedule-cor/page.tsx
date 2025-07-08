'use client';

import { useState } from 'react';
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
import { CalendarCheck, PlusCircle, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Schedule {
  id: string;
  customerName: string;
  projectLocation: string;
  concreteQuality: string;
  slump: string;
  volume: string;
  mediaCor: 'CP' | 'Manual';
}

const initialFormState = {
  customerName: '',
  projectLocation: '',
  concreteQuality: '',
  slump: '',
  volume: '',
  mediaCor: 'CP' as const,
};

export default function ScheduleCorPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [formState, setFormState] = useState<Omit<Schedule, 'id'>>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
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
    };
    setSchedules(prev => [...prev, newSchedule]);
    setFormState(initialFormState); // Reset form
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Tambah Jadwal Pengecoran Baru
          </CardTitle>
          <CardDescription>
            Masukkan detail jadwal pengecoran untuk hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formState.customerName}
                onChange={handleInputChange}
                placeholder="Contoh: PT. Abadi Jaya"
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
            <div className="md:col-span-3 flex justify-end items-end">
              <Button type="submit">Tambah Jadwal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Daftar Schedule Cor Hari Ini
          </CardTitle>
          <CardDescription>
            Lihat dan kelola semua jadwal pengecoran untuk hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
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
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell>{schedule.customerName}</TableCell>
                                <TableCell>{schedule.projectLocation}</TableCell>
                                <TableCell>{schedule.concreteQuality}</TableCell>
                                <TableCell>{schedule.slump}</TableCell>
                                <TableCell>{schedule.volume}</TableCell>
                                <TableCell>{schedule.mediaCor}</TableCell>
                                <TableCell className="text-center">
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
              <p>Belum ada jadwal yang ditambahkan untuk hari ini.</p>
              <p>Gunakan formulir di atas untuk menambahkan jadwal baru.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
