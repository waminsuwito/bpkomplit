'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, PlusCircle, Trash2, Sheet as SheetIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EditableVehicleList } from '@/components/karyawan/editable-vehicle-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const VEHICLES_STORAGE_KEY = 'app-vehicles';

interface Vehicle {
  id: string;
  nomorPolisi: string;
  nomorLambung: string;
  jenisKendaraan: string;
  namaOperatorSopir: string;
  nik: string;
}

const initialFormState = {
  nomorPolisi: '',
  nomorLambung: '',
  jenisKendaraan: '',
  namaOperatorSopir: '',
  nik: '',
};

export default function ManajemenPeralatanPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const [isListOpen, setIsListOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVehicles();
  }, []);
  
  // Also reload vehicles when the dialog is closed, in case changes were made
  useEffect(() => {
    if (!isListOpen) {
      loadVehicles();
    }
  }, [isListOpen]);

  const loadVehicles = () => {
     try {
      const storedVehicles: Vehicle[] = JSON.parse(localStorage.getItem(VEHICLES_STORAGE_KEY) || '[]');
      setVehicles(storedVehicles);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nomorPolisi.trim() && !formState.nomorLambung.trim()) {
        toast({
            variant: 'destructive',
            title: 'Gagal',
            description: 'Nomor Polisi atau Nomor Lambung harus diisi.',
        });
        return;
    }
    
    const newVehicle: Vehicle = {
        ...formState,
        id: new Date().toISOString() + Math.random(),
    };

    const updatedVehicles = [...vehicles, newVehicle];
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    setVehicles(updatedVehicles);
    setFormState(initialFormState);
    toast({ title: 'Berhasil', description: 'Kendaraan baru telah ditambahkan.' });
  };
  
  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    setVehicles(updatedVehicles);
     toast({
      variant: 'destructive',
      title: 'Dihapus',
      description: 'Data kendaraan telah dihapus.',
    });
  }
  
  return (
    <div className="space-y-6">
        <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-6 w-6 text-primary" />
                            Tambah Kendaraan Baru
                        </CardTitle>
                        <CardDescription>
                            Gunakan formulir ini untuk menambah satu kendaraan atau gunakan "List Armada" untuk edit massal.
                        </CardDescription>
                        </div>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <SheetIcon className="mr-2 h-4 w-4" />
                                List Armada
                            </Button>
                        </DialogTrigger>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="nomorLambung">Nomor Lambung</Label>
                            <Input id="nomorLambung" name="nomorLambung" value={formState.nomorLambung} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="nomorPolisi">Nomor Polisi</Label>
                            <Input id="nomorPolisi" name="nomorPolisi" value={formState.nomorPolisi} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>
                         <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="jenisKendaraan">Jenis Kendaraan</Label>
                            <Input id="jenisKendaraan" name="jenisKendaraan" value={formState.jenisKendaraan} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="namaOperatorSopir">Nama Sopir/Operator</Label>
                            <Input id="namaOperatorSopir" name="namaOperatorSopir" value={formState.namaOperatorSopir} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>
                         <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="nik">NIK</Label>
                            <Input id="nik" name="nik" value={formState.nik} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="md:col-span-1">
                            <Button type="submit" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
               <EditableVehicleList />
            </DialogContent>
        </Dialog>


        <Card>
            <CardHeader>
                <CardTitle>Daftar Kendaraan Saat Ini</CardTitle>
                <CardDescription>Menampilkan daftar semua kendaraan yang terdaftar.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Nomor Lambung</TableHead>
                                <TableHead>Nomor Polisi</TableHead>
                                <TableHead>Jenis Kendaraan</TableHead>
                                <TableHead>Nama Sopir/Operator</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.length > 0 ? (
                                vehicles.map((v, index) => (
                                <TableRow key={v.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{v.nomorLambung}</TableCell>
                                    <TableCell>{v.nomorPolisi}</TableCell>
                                    <TableCell>{v.jenisKendaraan}</TableCell>
                                    <TableCell>{v.namaOperatorSopir}</TableCell>
                                    <TableCell>{v.nik}</TableCell>
                                    <TableCell className="text-center">
                                       <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                  Apakah Anda yakin ingin menghapus kendaraan dengan Nopol {v.nomorPolisi || v.nomorLambung}?
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Batal</AlertDialogCancel>
                                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteVehicle(v.id)}>
                                                  Ya, Hapus
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Belum ada kendaraan yang ditambahkan.
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
