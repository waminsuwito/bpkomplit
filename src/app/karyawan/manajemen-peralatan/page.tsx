'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Save, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { printElement } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const VEHICLES_STORAGE_KEY = 'app-vehicles';
const TOTAL_ROWS = 300;

// Simplified interface, operatorId is removed
interface Vehicle {
  id: string;
  nomorPolisi: string;
  nomorLambung: string;
  jenisKendaraan: string;
  namaOperatorSopir: string;
}

// A row can be a Vehicle or an empty object for placeholder rows
type TableRowData = Partial<Vehicle>;

const fields: (keyof Omit<Vehicle, 'id'>)[] = ['nomorLambung', 'nomorPolisi', 'jenisKendaraan', 'namaOperatorSopir'];
const headers = ['NOMOR LAMBUNG', 'NOMOR POLISI', 'JENIS KENDARAAN', 'NAMA SOPIR/OPRATOR'];

export default function ManajemenPeralatanPage() {
  const [tableData, setTableData] = useState<TableRowData[]>(
    Array(TOTAL_ROWS).fill({})
  );
  const { toast } = useToast();

  useEffect(() => {
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
    }
  }, []);

  const handleInputChange = (index: number, field: keyof Vehicle, value: string) => {
    const updatedData = [...tableData];
    // Create a new object for the row to ensure re-render
    updatedData[index] = { ...updatedData[index], [field]: value.toUpperCase() };
    setTableData(updatedData);
  };

  const handleDeleteRow = (index: number) => {
    const updatedData = [...tableData];
    updatedData.splice(index, 1); // Remove the item
    updatedData.push({}); // Add an empty row at the end to maintain total row count
    setTableData(updatedData);
     toast({
      variant: 'destructive',
      title: 'Baris Dihapus',
      description: 'Data baris telah dihapus dari tampilan. Klik "Simpan" untuk menyimpan perubahan.',
    });
  };

  const handleSaveData = () => {
    try {
      // Filter out empty rows, assign IDs to new rows
      const vehiclesToSave = tableData
        .filter(row => (row.nomorPolisi && row.nomorPolisi.trim() !== '') || (row.nomorLambung && row.nomorLambung.trim() !== ''))
        .map((vehicleData) => ({
          nomorLambung: vehicleData.nomorLambung || '',
          nomorPolisi: vehicleData.nomorPolisi || '',
          jenisKendaraan: vehicleData.jenisKendaraan || '',
          namaOperatorSopir: vehicleData.namaOperatorSopir || '',
          id: vehicleData.id || new Date().toISOString() + Math.random(), // Assign ID if new
        }));

      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehiclesToSave));
      
      // Pad again to ensure UI has 30 rows and re-sync state
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
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const { key } = e;
    let nextRowIndex = rowIndex;
    let nextColIndex = colIndex;

    if (key === 'Enter' || key === 'ArrowDown') {
        e.preventDefault();
        nextRowIndex = rowIndex + 1;
    } else if (key === 'ArrowUp') {
        e.preventDefault();
        nextRowIndex = rowIndex - 1;
    } else if (key === 'ArrowRight') {
        // Only prevent default if not at the end of the input
        if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
            e.preventDefault();
            nextColIndex = colIndex + 1;
        }
    } else if (key === 'ArrowLeft') {
        // Only prevent default if at the start of the input
        if (e.currentTarget.selectionStart === 0) {
            e.preventDefault();
            nextColIndex = colIndex - 1;
        }
    } else {
        return; // Other keys do default behavior
    }

    // Handle wrapping around columns
    if (nextColIndex >= fields.length) {
        nextColIndex = 0;
        nextRowIndex = rowIndex + 1;
    }
    if (nextColIndex < 0) {
        nextColIndex = fields.length - 1;
        nextRowIndex = rowIndex - 1;
    }

    // Check bounds for rows
    if (nextRowIndex >= 0 && nextRowIndex < TOTAL_ROWS) {
        const nextField = fields[nextColIndex];
        const nextInputId = `${nextField}-${nextRowIndex}`;
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
  };

  return (
    <Card id="manajemen-alat-content">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Manajemen Alat
              </CardTitle>
              <CardDescription>
                Tambah, edit, atau hapus data kendaraan langsung dari tabel di bawah ini. Klik "Simpan Semua Perubahan" untuk menyimpan.
              </CardDescription>
            </div>
            <div className="flex gap-2 no-print">
                <Button onClick={() => printElement('manajemen-alat-content')}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak
                </Button>
                 <Button onClick={handleSaveData}>
                    <Save className="mr-2 h-4 w-4" /> Simpan Semua Perubahan
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto bg-white text-black p-1">
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
                                onKeyDown={(e) => handleKeyDown(e, index, colIndex)}
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
      </CardContent>
    </Card>
  );
}
