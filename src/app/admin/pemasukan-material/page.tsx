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
import { PackagePlus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MATERIAL_MASUK_STORAGE_KEY = 'app-material-masuk';
const materialOptions = ["Batu", "Pasir", "Semen", "Obat Beton"];

interface MaterialMasuk {
  id: string;
  namaMaterial: string;
  asalMaterial: string;
  volume: string;
  keterangan: string;
  tanggal: string;
}

const initialFormState = {
  namaMaterial: '',
  asalMaterial: '',
  volume: '',
  keterangan: '',
};

export default function PemasukanMaterialPage() {
  const [daftarMaterialMasuk, setDaftarMaterialMasuk] = useState<MaterialMasuk[]>([]);
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(MATERIAL_MASUK_STORAGE_KEY);
      if (storedData) {
        setDaftarMaterialMasuk(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const saveToLocalStorage = (data: MaterialMasuk[]) => {
    try {
      localStorage.setItem(MATERIAL_MASUK_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({...prev, [name]: value}));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formState.namaMaterial.trim() ||
      !formState.asalMaterial.trim() ||
      !formState.volume.trim()
    ) {
      alert('Nama Material, Asal Material, dan Volume harus diisi.');
      return;
    }
    const newItem: MaterialMasuk = {
      id: new Date().toISOString(),
      ...formState,
      tanggal: new Date().toLocaleDateString('id-ID'),
    };
    const updatedData = [...daftarMaterialMasuk, newItem];
    setDaftarMaterialMasuk(updatedData);
    saveToLocalStorage(updatedData);
    setFormState(initialFormState); // Reset form
  };

  const handleDeleteItem = (id: string) => {
    const updatedData = daftarMaterialMasuk.filter(item => item.id !== id);
    setDaftarMaterialMasuk(updatedData);
    saveToLocalStorage(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" />
            Pemasukan Material
          </CardTitle>
          <CardDescription>
            Catat material yang masuk ke gudang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMaterial} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="namaMaterial">Nama Material</Label>
              <Select
                name="namaMaterial"
                value={formState.namaMaterial}
                onValueChange={(value) => handleSelectChange('namaMaterial', value)}
              >
                <SelectTrigger id="namaMaterial">
                  <SelectValue placeholder="Pilih material" />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asalMaterial">Asal Material</Label>
              <Input
                id="asalMaterial"
                name="asalMaterial"
                value={formState.asalMaterial}
                onChange={handleInputChange}
                placeholder="Contoh: Tambang XYZ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume / Jumlah</Label>
              <Input
                id="volume"
                name="volume"
                value={formState.volume}
                onChange={handleInputChange}
                placeholder="Contoh: 10 Ton"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                name="keterangan"
                value={formState.keterangan}
                onChange={handleInputChange}
                placeholder="Opsional"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Tambah</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pemasukan Material</CardTitle>
          <CardDescription>
            Daftar material yang telah diterima.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {daftarMaterialMasuk.length > 0 ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Nama Material</TableHead>
                            <TableHead>Asal Material</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {daftarMaterialMasuk.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.tanggal}</TableCell>
                                <TableCell>{item.namaMaterial}</TableCell>
                                <TableCell>{item.asalMaterial}</TableCell>
                                <TableCell>{item.volume}</TableCell>
                                <TableCell>{item.keterangan}</TableCell>
                                <TableCell className="text-center">
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)}>
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
              <p>Belum ada data pemasukan material.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
