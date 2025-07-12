
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { printElement } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const VEHICLES_STORAGE_KEY = 'app-vehicles';
const TOTAL_ROWS = 300;

interface Vehicle {
  id: string;
  nomorPolisi: string;
  nomorLambung: string;
  jenisKendaraan: string;
  namaOperatorSopir: string;
  nik: string;
}

type TableRowData = Partial<Vehicle>;

const fields: (keyof Omit<Vehicle, 'id'>)[] = ['nomorLambung', 'nomorPolisi', 'jenisKendaraan', 'namaOperatorSopir', 'nik'];
const headers = ['NOMOR LAMBUNG', 'NOMOR POLISI', 'JENIS KENDARAAN', 'NAMA SOPIR/OPRATOR', 'NIK'];

export function EditableVehicleList() {
  const [tableData, setTableData] = useState<TableRowData[]>(Array(TOTAL_ROWS).fill({}));
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // This is the critical fix: localStorage is only accessed inside useEffect.
    try {
      const storedVehicles: Vehicle[] = JSON.parse(localStorage.getItem(VEHICLES_STORAGE_KEY) || '[]');
      const initialData = Array(TOTAL_ROWS).fill({});
      storedVehicles.forEach((vehicle, index) => {
        if (index < TOTAL_ROWS) {
          initialData[index] = vehicle;
        }
      });
      setTableData(initialData);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (index: number, field: keyof Vehicle, value: string) => {
    const updatedData = [...tableData];
    updatedData[index] = { ...updatedData[index], [field]: value.toUpperCase() };
    setTableData(updatedData);
  };

  const handleDeleteRow = (index: number) => {
    const updatedData = [...tableData];
    updatedData.splice(index, 1);
    updatedData.push({});
    setTableData(updatedData);
    toast({
      variant: 'destructive',
      title: 'Baris Dihapus',
      description: 'Data baris telah dihapus dari tampilan. Klik "Simpan" untuk menyimpan perubahan.',
    });
  };

  const handleSaveData = () => {
    try {
      const vehiclesToSave = tableData
        .filter(row => (row.nomorPolisi && row.nomorPolisi.trim() !== '') || (row.nomorLambung && row.nomorLambung.trim() !== ''))
        .map((vehicleData) => ({
          nomorLambung: vehicleData.nomorLambung || '',
          nomorPolisi: vehicleData.nomorPolisi || '',
          jenisKendaraan: vehicleData.jenisKendaraan || '',
          namaOperatorSopir: vehicleData.namaOperatorSopir || '',
          nik: vehicleData.nik || '',
          id: vehicleData.id || new Date().toISOString() + Math.random(),
        }));

      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehiclesToSave));
      
      const rePaddedData = Array(TOTAL_ROWS).fill({});
      vehiclesToSave.forEach((vehicle, index) => {
         if (index < TOTAL_ROWS) {
          rePaddedData[index] = vehicle;
        }
      });
      setTableData(rePaddedData);

      toast({ title: 'Berhasil', description: 'Semua perubahan telah disimpan.' });
    } catch (error) {
      console.error("Failed to save vehicles:", error);
      toast({ variant: 'destructive', title: 'Gagal', description: 'Tidak dapat menyimpan data.' });
    }
  };

  if (isLoading) {
    return (
        <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div id="editable-vehicle-list" className="flex flex-col h-full bg-background">
        <div className="flex-shrink-0 p-4 border-b bg-background flex justify-between items-center no-print">
            <h2 className="text-lg font-semibold">List Armada (Mode Edit Massal)</h2>
            <div className="flex gap-2">
                 <Button onClick={() => printElement('editable-vehicle-list-table-container')}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak
                </Button>
                 <Button onClick={handleSaveData}>
                    <Save className="mr-2 h-4 w-4" /> Simpan Semua Perubahan
                </Button>
            </div>
        </div>

        <ScrollArea className="flex-grow">
            <div id="editable-vehicle-list-table-container" className="bg-white text-black p-2">
                 <h2 className="text-2xl font-bold text-center mb-4 text-black print-only">LIST ARMADA</h2>
                <Table className="w-full border-collapse">
                <TableHeader>
                    <TableRow className="bg-gray-200">
                    {headers.map(header => (
                        <TableHead key={header} className="border border-gray-400 p-2 text-center font-bold text-black">{header}</TableHead>
                    ))}
                    <TableHead className="border border-gray-400 p-2 text-center font-bold text-black no-print">AKSI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableData.map((row, index) => (
                    <TableRow key={row.id || `row-${index}`} className="[&_td]:p-0 [&_td]:border-gray-400">
                        {fields.map((field, colIndex) => (
                            <TableCell key={field} className="border">
                                <Input
                                    id={`${field}-${index}`}
                                    value={row[field] || ''}
                                    onChange={(e) => handleInputChange(index, field, e.target.value)}
                                    className="w-full h-full border-none rounded-none text-center bg-transparent text-black"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </TableCell>
                        ))}
                        <TableCell className="border text-center no-print">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!row.nomorPolisi && !row.nomorLambung}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus baris ini? Perubahan akan permanen setelah Anda menekan tombol 'Simpan'.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRow(index)}>
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
        </ScrollArea>
    </div>
  );
}
