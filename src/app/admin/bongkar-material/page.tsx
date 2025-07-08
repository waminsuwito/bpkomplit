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
import { Anchor, Trash2, CheckCircle, Coffee, Play } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BONGKAR_MATERIAL_STORAGE_KEY = 'app-bongkar-material';
const materialOptions = ["Batu", "Pasir", "Semen", "Obat Beton"];

type BongkarStatus = 'Proses' | 'Istirahat' | 'Selesai';

interface BongkarMaterial {
  id: string;
  namaMaterial: string;
  kapalKendaraan: string;
  namaKaptenSopir: string;
  volume: string;
  keterangan: string;
  waktuMulai: string;
  waktuSelesai: string | null;
  status: BongkarStatus;
}

const initialFormState = {
  namaMaterial: '',
  kapalKendaraan: '',
  namaKaptenSopir: '',
  volume: '',
  keterangan: '',
};

export default function BongkarMaterialPage() {
  const [daftarBongkar, setDaftarBongkar] = useState<BongkarMaterial[]>([]);
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(BONGKAR_MATERIAL_STORAGE_KEY);
      if (storedData) {
        setDaftarBongkar(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const saveToLocalStorage = (data: BongkarMaterial[]) => {
    try {
      localStorage.setItem(BONGKAR_MATERIAL_STORAGE_KEY, JSON.stringify(data));
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

  const getUnit = (material: string): string => {
    switch (material) {
        case "Batu":
        case "Pasir":
            return "M³";
        case "Semen":
            return "Kg";
        case "Obat Beton":
            return "Liter";
        default:
            return "";
    }
  };

  const handleMulaiBongkar = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof typeof initialFormState)[] = ['namaMaterial', 'kapalKendaraan', 'namaKaptenSopir', 'volume'];
    for (const field of requiredFields) {
        if (!formState[field].trim()) {
            alert(`Kolom "${field.replace(/([A-Z])/g, ' $1').trim()}" harus diisi.`);
            return;
        }
    }

    const unit = getUnit(formState.namaMaterial);
    const newItem: BongkarMaterial = {
      id: new Date().toISOString(),
      ...formState,
      volume: `${formState.volume} ${unit}`.trim(),
      waktuMulai: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      waktuSelesai: null,
      status: 'Proses',
    };
    const updatedData = [...daftarBongkar, newItem];
    setDaftarBongkar(updatedData);
    saveToLocalStorage(updatedData);
    setFormState(initialFormState); // Reset form
  };

  const handleSelesaiBongkar = (id: string) => {
    const updatedData = daftarBongkar.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Selesai' as const,
          waktuSelesai: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
        };
      }
      return item;
    });
    setDaftarBongkar(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleToggleIstirahat = (id: string, newStatus: 'Proses' | 'Istirahat') => {
    const updatedData = daftarBongkar.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setDaftarBongkar(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleDeleteItem = (id: string) => {
    const updatedData = daftarBongkar.filter(item => item.id !== id);
    setDaftarBongkar(updatedData);
    saveToLocalStorage(updatedData);
  };
  
  const unit = getUnit(formState.namaMaterial);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Bongkar Material
          </CardTitle>
          <CardDescription>
            Catat aktivitas bongkar material dari kapal atau kendaraan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMulaiBongkar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="namaMaterial">Nama Material</Label>
              <Select name="namaMaterial" value={formState.namaMaterial} onValueChange={(value) => handleSelectChange('namaMaterial', value)}>
                <SelectTrigger id="namaMaterial"><SelectValue placeholder="Pilih material" /></SelectTrigger>
                <SelectContent>
                  {materialOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapalKendaraan">Kapal/Kendaraan</Label>
              <Input id="kapalKendaraan" name="kapalKendaraan" value={formState.kapalKendaraan} onChange={handleInputChange} placeholder="Contoh: KM. Bahari / BM 1234 XY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaKaptenSopir">Nama Kapten/Sopir</Label>
              <Input id="namaKaptenSopir" name="namaKaptenSopir" value={formState.namaKaptenSopir} onChange={handleInputChange} placeholder="Contoh: Budi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume / Jumlah {unit && `(${unit})`}</Label>
              <Input id="volume" name="volume" type="number" value={formState.volume} onChange={handleInputChange} placeholder={unit ? "Contoh: 1000" : "Pilih material"} disabled={!formState.namaMaterial} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input id="keterangan" name="keterangan" value={formState.keterangan} onChange={handleInputChange} placeholder="Opsional" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <Button type="submit" className="w-full md:w-auto">Mulai Bongkar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Bongkar Material</CardTitle>
          <CardDescription>
            Daftar aktivitas bongkar material yang sedang berjalan dan yang sudah selesai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {daftarBongkar.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Mulai Bongkar</TableHead>
                            <TableHead>Selesai Bongkar</TableHead>
                            <TableHead>Nama Material</TableHead>
                            <TableHead>Kapal/Kendaraan</TableHead>
                            <TableHead>Kapten/Sopir</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {daftarBongkar.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                  <Badge 
                                    variant={item.status === 'Selesai' ? 'default' : 'secondary'}
                                    className={cn(item.status === 'Istirahat' && 'bg-accent text-accent-foreground hover:bg-accent/80')}
                                  >
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.waktuMulai}</TableCell>
                                <TableCell>{item.waktuSelesai || '-'}</TableCell>
                                <TableCell>{item.namaMaterial}</TableCell>
                                <TableCell>{item.kapalKendaraan}</TableCell>
                                <TableCell>{item.namaKaptenSopir}</TableCell>
                                <TableCell>{item.volume}</TableCell>
                                <TableCell>{item.keterangan}</TableCell>
                                <TableCell className="text-center space-x-2">
                                    {item.status === 'Proses' && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => handleToggleIstirahat(item.id, 'Istirahat')}>
                                                <Coffee className="h-4 w-4 mr-2" />
                                                Istirahat
                                            </Button>
                                            <Button variant="default" size="sm" onClick={() => handleSelesaiBongkar(item.id)}>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Selesai
                                            </Button>
                                        </>
                                    )}
                                    {item.status === 'Istirahat' && (
                                        <>
                                            <Button variant="default" size="sm" onClick={() => handleToggleIstirahat(item.id, 'Proses')}>
                                                <Play className="h-4 w-4 mr-2" />
                                                Lanjut
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => handleSelesaiBongkar(item.id)}>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Selesai
                                            </Button>
                                        </>
                                    )}
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
              <p>Belum ada data bongkar material.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
