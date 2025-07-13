
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Save, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { getScheduleSheetData, saveScheduleSheetData, SCHEDULE_SHEET_STORAGE_KEY } from '@/lib/schedule';
import type { ScheduleSheetRow } from '@/lib/types';
import { cn } from '@/lib/utils';


const TOTAL_ROWS = 15;

const headers = [
    'NO', 'NO PO', 'NAMA', 'LOKASI', 'GRADE', 'SLUMP (CM)', 'CP/M',
    'VOL M³', 'TEKIRIM M³', 'SISA M³', 'PENAMBAHAN VOL M³', 'TOTAL M³', 'SELESAI'
];
const fieldKeys: (keyof ScheduleSheetRow)[] = [
    'no', 'noPo', 'nama', 'lokasi', 'mutuBeton', 'slump', 'mediaCor',
    'volume', 'terkirim', 'sisa', 'penambahanVol', 'totalVol', 'status'
];


export function ScheduleSheet({ isOperatorView }: { isOperatorView?: boolean }) {
  const [data, setData] = useState<ScheduleSheetRow[]>(() => Array(TOTAL_ROWS).fill({}).map(() => ({} as ScheduleSheetRow)));
  const [date, setDate] = useState(format(new Date(), 'dd MMMM yyyy'));
  const { toast } = useToast();

  const loadDataFromStorage = () => {
    try {
      const storedData = getScheduleSheetData();
      if (storedData.length > 0) {
        const fullData = [...storedData];
        while (fullData.length < TOTAL_ROWS) {
            fullData.push({} as ScheduleSheetRow);
        }
        setData(fullData);
      } else {
         setData(Array(TOTAL_ROWS).fill({}).map(() => ({} as ScheduleSheetRow)));
      }
    } catch (error) {
        console.error("Failed to load schedule sheet data", error);
    }
  };

  useEffect(() => {
    loadDataFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SCHEDULE_SHEET_STORAGE_KEY) {
        loadDataFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleInputChange = (rowIndex: number, key: keyof ScheduleSheetRow, value: string) => {
    const updatedData = [...data];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [key]: value.toUpperCase() };
    
    // Auto-calculate 'sisa' and 'total'
    const volume = parseFloat(updatedData[rowIndex].volume || '0');
    const terkirim = parseFloat(updatedData[rowIndex].terkirim || '0');
    const penambahan = parseFloat(updatedData[rowIndex].penambahanVol || '0');
    
    if (!isNaN(volume) && !isNaN(terkirim)) {
        updatedData[rowIndex].sisa = (volume - terkirim).toFixed(2);
    }
    
    if (!isNaN(volume) && !isNaN(penambahan)) {
        updatedData[rowIndex].totalVol = (volume + penambahan).toFixed(2);
    }

    setData(updatedData);
  };
  
  const handleSave = () => {
     try {
        saveScheduleSheetData(data);
        toast({ title: 'Berhasil', description: 'Data schedule berhasil disimpan.' });
    } catch (error) {
        console.error("Failed to save schedule sheet data", error);
        toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal menyimpan data schedule.' });
    }
  }

  const handleStatusToggle = (rowIndex: number) => {
    const updatedData = [...data];
    if (updatedData[rowIndex].status !== 'Selesai') {
        updatedData[rowIndex].status = 'Selesai';
        setData(updatedData);
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, rowIndex: number, colIndex: number) => {
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
        e.preventDefault();
        nextColIndex = colIndex + 1;
    } else if (key === 'ArrowLeft') {
        e.preventDefault();
        nextColIndex = colIndex - 1;
    } else {
        return;
    }

    if (nextColIndex >= fieldKeys.length) {
        nextColIndex = 0;
        nextRowIndex = rowIndex + 1;
    }
    if (nextColIndex < 0) {
        nextColIndex = fieldKeys.length - 1;
        nextRowIndex = rowIndex - 1;
    }

    if (nextRowIndex >= 0 && nextRowIndex < TOTAL_ROWS) {
        const nextField = fieldKeys[nextColIndex];
        const nextInputId = `${nextField}-${nextRowIndex}`;
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
  };

  const renderCellContent = (row: ScheduleSheetRow, key: keyof ScheduleSheetRow, rowIndex: number, colIndex: number) => {
    const isReadOnlyForAdmin = !isOperatorView && ['terkirim', 'sisa', 'totalVol', 'status'].includes(key);
    
    let displayValue;
    const isScheduledRow = row.volume && row.volume.trim() !== '';

    if (key === 'terkirim') {
        if (isScheduledRow && (!row.terkirim || row.terkirim.trim() === '')) {
            displayValue = '0';
        } else {
            displayValue = row.terkirim || '';
        }
    } else if (key === 'status') {
       if (!isScheduledRow) return null;
       
       if (isOperatorView) {
         return (
            <div className={`w-full min-h-[40px] text-center flex items-center justify-center p-2 font-semibold ${row.status === 'Selesai' ? 'text-green-600' : 'text-amber-600'}`}>
                {row.status || 'Proses'}
            </div>
         );
       }

       return (
            <Button 
                size="sm" 
                variant={row.status === 'Selesai' ? 'default' : 'secondary'} 
                className={cn('w-full h-full rounded-none', row.status === 'Selesai' && 'bg-green-600 hover:bg-green-700')}
                onClick={() => handleStatusToggle(rowIndex)}
                disabled={row.status === 'Selesai'}
            >
                {row.status === 'Selesai' && <CheckCircle className="mr-2 h-4 w-4" />}
                {row.status === 'Selesai' ? 'Selesai' : 'Tandai Selesai'}
            </Button>
       );
    } else {
        displayValue = row[key] || '';
    }

    if (isOperatorView || isReadOnlyForAdmin) {
      return (
        <div className="w-full min-h-[40px] text-center bg-transparent flex items-center justify-center p-2">
          <p className="whitespace-pre-wrap break-words">{displayValue}</p>
        </div>
      );
    }
  
    return (
      <Textarea
        id={`${key}-${rowIndex}`}
        value={row[key] || ''}
        onChange={e => handleInputChange(rowIndex, key, e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
        className="w-full min-h-[40px] border-none rounded-none text-center bg-transparent text-black resize-none p-2"
        style={{ textTransform: 'uppercase' }}
      />
    );
  };


  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        SCHEDULE COR HARI INI
                    </CardTitle>
                    <CardDescription>Tanggal: {date}</CardDescription>
                </div>
                {!isOperatorView && (
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg overflow-x-auto bg-white text-black p-2">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-200 hover:bg-gray-200">
                            {headers.map(header => (
                                <TableHead key={header} className="text-center font-bold whitespace-nowrap px-2 text-black">{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow 
                                key={`row-${rowIndex}`} 
                                className={cn(
                                    "[&_td]:p-0 hover:bg-gray-100",
                                    row.status === 'Selesai' && 'bg-green-100 hover:bg-green-200/50'
                                )}
                            >
                                {fieldKeys.map((key, colIndex) => (
                                    <TableCell key={`${key}-${rowIndex}`} className="border-t border-gray-300 align-top h-[40px]">
                                        {renderCellContent(row, key, rowIndex, colIndex)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
