
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

const SCHEDULE_SHEET_STORAGE_KEY = 'app-schedule-sheet-data';
const TOTAL_ROWS = 15;

const headers = [
    'NO', 'NO PO', 'NAMA', 'LOKASI', 'MUTU BETON', 'SLUMP (CM)', 
    'VOLUME M3', 'TM KE', 'TEKIRIM M3', 'SISA M3', 'VOL LOADING'
];
const fieldKeys = [
    'no', 'noPo', 'nama', 'lokasi', 'mutuBeton', 'slump', 
    'volume', 'tmKe', 'terkirim', 'sisa', 'volLoading'
];

type ScheduleRow = {
    [key in typeof fieldKeys[number]]: string;
};

export function ScheduleSheet() {
  const [data, setData] = useState<ScheduleRow[]>(() => Array(TOTAL_ROWS).fill({}).map(() => ({} as ScheduleRow)));
  const [date, setDate] = useState(format(new Date(), 'dd MMMM yyyy'));

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(SCHEDULE_SHEET_STORAGE_KEY);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
        console.error("Failed to load schedule sheet data", error);
    }
  }, []);

  const handleInputChange = (rowIndex: number, key: string, value: string) => {
    const updatedData = [...data];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [key]: value.toUpperCase() };
    setData(updatedData);
    // Auto-save on change
    try {
        localStorage.setItem(SCHEDULE_SHEET_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
        console.error("Failed to auto-save schedule sheet data", error);
    }
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
                            <TableRow key={`row-${rowIndex}`} className="[&_td]:p-0 hover:bg-gray-100">
                                {fieldKeys.map(key => (
                                    <TableCell key={`${key}-${rowIndex}`} className="border-t border-gray-300">
                                        <Input
                                            value={row[key] || ''}
                                            onChange={e => handleInputChange(rowIndex, key, e.target.value)}
                                            className="w-full h-full border-none rounded-none text-center bg-transparent text-black"
                                            style={{ textTransform: 'uppercase' }}
                                        />
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
