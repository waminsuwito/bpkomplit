
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, SlidersHorizontal, PlusCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export const RELAY_MAPPINGS_KEY = 'app-relay-mappings';

const defaultControlKeys = [
  'pasir1', 'pasir2', 'batu1', 'batu2', 'airTimbang', 'airBuang',
  'semenTimbang', 'semen', 'pintuBuka', 'pintuTutup', 'konveyorBawah',
  'konveyorAtas', 'klakson'
] as const;

type ControlKey = typeof defaultControlKeys[number] | string;

export interface ControlMapping {
  id: ControlKey;
  label: string; // User-editable label
  relayName: string;
}

const formatDefaultLabel = (key: string): string => {
  if (key.startsWith('custom-')) {
    return 'Tombol Baru';
  }
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const getInitialMappings = (): ControlMapping[] => {
    return defaultControlKeys.map(key => ({
        id: key,
        label: formatDefaultLabel(key),
        relayName: ''
    }));
};

export default function RelaySettingsPage() {
  const [mappings, setMappings] = useState<ControlMapping[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMappingsRaw = localStorage.getItem(RELAY_MAPPINGS_KEY);
      if (storedMappingsRaw) {
        const storedMappings = JSON.parse(storedMappingsRaw);
        setMappings(storedMappings);
      } else {
        setMappings(getInitialMappings());
      }
    } catch (error) {
      console.error("Failed to load relay settings:", error);
      setMappings(getInitialMappings());
    }
  }, []);

  const handleInputChange = (id: ControlKey, field: 'label' | 'relayName', value: string) => {
    const newMappings = mappings.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    setMappings(newMappings);
  };
  
  const handleAddNewRow = () => {
    const newRow: ControlMapping = {
      id: `custom-${Date.now()}`,
      label: '',
      relayName: '',
    };
    setMappings(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (idToDelete: ControlKey) => {
    setMappings(prev => prev.filter(m => m.id !== idToDelete));
    toast({ variant: 'destructive', title: 'Baris Dihapus', description: 'Baris telah dihapus. Jangan lupa simpan perubahan.' });
  };

  const handleSaveAll = () => {
    try {
      const mappingsToSave = mappings.filter(m => m.label.trim() !== '' || m.relayName.trim() !== '');
      localStorage.setItem(RELAY_MAPPINGS_KEY, JSON.stringify(mappingsToSave));
      setMappings(mappingsToSave);
      toast({ title: 'Berhasil', description: 'Semua pengaturan relay telah disimpan.' });
    } catch (error) {
      console.error("Failed to save relay settings:", error);
      toast({ variant: 'destructive', title: 'Gagal', description: 'Tidak dapat menyimpan pengaturan relay.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6 text-primary" />
                    Setting Relay & Label Tombol
                </CardTitle>
                <CardDescription>
                    Kustomisasi nama tombol kontrol, tetapkan nama relay, dan tambahkan baris baru jika perlu.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Kembali ke Dashboard
                    </Link>
                </Button>
                 <Button onClick={handleSaveAll}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Semua Perubahan
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Label Tombol (Bisa Diedit)</TableHead>
                <TableHead className="w-1/3">Nama Relay (Bisa Diedit)</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">
                     <Input
                      placeholder={`Contoh: ${formatDefaultLabel(mapping.id)}`}
                      value={mapping.label}
                      onChange={(e) => handleInputChange(mapping.id, 'label', e.target.value)}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder={`Contoh: Relay ${mapping.id}`}
                      value={mapping.relayName}
                      onChange={(e) => handleInputChange(mapping.id, 'relayName', e.target.value)}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus baris untuk "{mapping.label || 'Baris kosong'}"?
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRow(mapping.id)}>
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
        <div className="mt-4 flex justify-start">
            <Button variant="outline" onClick={handleAddNewRow}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Baris Baru
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
