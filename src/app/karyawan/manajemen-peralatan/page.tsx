
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Wrench, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { getUsers } from '@/lib/auth';

const VEHICLES_STORAGE_KEY = 'app-vehicles';

interface Vehicle {
  id: string;
  nomorPolisi: string;
  nomorLambung: string;
  jenisKendaraan: string;
  operatorId: string;
  namaOperatorSopir: string;
}

const initialFormState = {
  nomorPolisi: '',
  nomorLambung: '',
  jenisKendaraan: '',
  operatorId: '',
};

export default function ManajemenPeralatanPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles));
      }
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }

    const allUsers = getUsers();
    const operatorUsers = allUsers.filter(u =>
      u.jabatan?.includes('SOPIR') || u.jabatan?.includes('OPRATOR')
    );
    setOperators(operatorUsers);
  }, []);

  const saveVehicles = (updatedVehicles: Vehicle[]) => {
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Failed to save vehicles:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value.toUpperCase() }));
  };

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, operatorId: value }));
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nomorPolisi || !formState.jenisKendaraan || !formState.operatorId) {
      toast({ variant: 'destructive', title: 'Form Belum Lengkap', description: 'Nomor Polisi, Jenis Kendaraan, dan Operator harus diisi.' });
      return;
    }

    const selectedOperator = operators.find(op => op.id === formState.operatorId);
    if (!selectedOperator) {
      toast({ variant: 'destructive', title: 'Error', description: 'Operator yang dipilih tidak valid.' });
      return;
    }

    const newVehicle: Vehicle = {
      id: new Date().toISOString(),
      nomorPolisi: formState.nomorPolisi,
      nomorLambung: formState.nomorLambung,
      jenisKendaraan: formState.jenisKendaraan,
      operatorId: selectedOperator.id,
      namaOperatorSopir: selectedOperator.username,
    };

    saveVehicles([...vehicles, newVehicle]);
    toast({ title: 'Berhasil', description: 'Kendaraan baru telah ditambahkan.' });
    setFormState(initialFormState);
  };

  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    saveVehicles(updatedVehicles);
    toast({ variant: 'destructive', title: 'Dihapus', description: 'Data kendaraan telah dihapus.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Tambah Kendaraan Baru
          </CardTitle>
          <CardDescription>
            Masukkan detail kendaraan baru ke dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="nomorPolisi">Nomor Polisi</Label>
              <Input id="nomorPolisi" name="nomorPolisi" value={formState.nomorPolisi} onChange={handleInputChange} placeholder="Contoh: BM 1234 AB" style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorLambung">Nomor Lambung</Label>
              <Input id="nomorLambung" name="nomorLambung" value={formState.nomorLambung} onChange={handleInputChange} placeholder="Contoh: TM-01" style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKendaraan">Jenis Kendaraan</Label>
              <Input id="jenisKendaraan" name="jenisKendaraan" value={formState.jenisKendaraan} onChange={handleInputChange} placeholder="Contoh: Truck Mixer" style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorId">Operator/Sopir</Label>
              <Select value={formState.operatorId} onValueChange={handleSelectChange}>
                <SelectTrigger id="operatorId">
                  <SelectValue placeholder="Pilih Operator/Sopir" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.username} ({op.nik})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit">Tambah Kendaraan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Daftar Kendaraan
          </CardTitle>
          <CardDescription>
            Daftar semua kendaraan yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Polisi</TableHead>
                    <TableHead>Nomor Lambung</TableHead>
                    <TableHead>Jenis Kendaraan</TableHead>
                    <TableHead>Operator/Sopir</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.nomorPolisi}</TableCell>
                      <TableCell>{vehicle.nomorLambung || '-'}</TableCell>
                      <TableCell>{vehicle.jenisKendaraan}</TableCell>
                      <TableCell>{vehicle.namaOperatorSopir}</TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus kendaraan dengan Nopol {vehicle.nomorPolisi}? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteVehicle(vehicle.id)}>
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
              <p>Belum ada data kendaraan. Gunakan formulir di atas untuk menambahkan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
