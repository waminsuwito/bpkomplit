
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Printer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getSchedules } from '@/lib/schedule';

const initialRowData = {
  lokasi: '',
  mutu: '',
  slump: '',
  volume: '',
  realisasi: '',
  pakaiPasir: '',
  pakaiBatu: '',
  pakaiSemen: '',
  pakaiAir: '',
  stokPasir: '',
  stokBatu: '',
  stokSemen: '',
  stokAir: '',
};

export default function LaporanHarianPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tableData, setTableData] = useState(
    Array.from({ length: 10 }, () => ({ ...initialRowData }))
  );

  useEffect(() => {
    if (!date) return;

    const allSchedules = getSchedules();
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const todaysSchedules = allSchedules.filter(s => s.date === selectedDateStr);

    const newTableData = todaysSchedules.map(schedule => ({
      ...initialRowData,
      lokasi: schedule.customerName,
      mutu: schedule.concreteQuality,
      slump: schedule.slump,
      volume: schedule.volume,
    }));

    const emptyRowCount = 10 - newTableData.length;
    if (emptyRowCount > 0) {
      for (let i = 0; i < emptyRowCount; i++) {
        newTableData.push({ ...initialRowData });
      }
    }

    setTableData(newTableData.slice(0, 10));
  }, [date]);

  const handleInputChange = (
    rowIndex: number,
    columnId: keyof typeof initialRowData,
    value: string
  ) => {
    const newData = [...tableData];
    newData[rowIndex][columnId] = value;
    setTableData(newData);
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="space-y-4">
      <Card className="print-content">
        <CardHeader>
          <CardTitle>Laporan Harian Produksi</CardTitle>
          <CardDescription>
            Laporan jadwal, pemakaian material, dan stok material aktual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">TANGGAL:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal no-print',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
               <span className="font-semibold print-only">{date ? format(date, 'PPP') : ''}</span>
            </div>
            <Button onClick={handlePrint} className="no-print">
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="border min-w-full" style={{ tableLayout: 'fixed' }}>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    colSpan={4}
                    className="text-center border font-bold text-foreground p-2 align-middle w-[30%]"
                  >
                    SCHEDULE HARI INI
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="text-center border font-bold text-foreground p-2 align-middle w-[8%]"
                  >
                    REALISASI SAAT INI ( M³ )
                  </TableHead>
                  <TableHead
                    colSpan={4}
                    className="text-center border font-bold text-foreground p-2 align-middle w-[32%]"
                  >
                    AKTUAL PEMAKAIAN MATERIAL
                  </TableHead>
                  <TableHead
                    colSpan={4}
                    className="text-center border font-bold text-foreground p-2 align-middle w-[32%]"
                  >
                    STOK MATERIAL AKTUAL SAAT INI
                  </TableHead>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[10%]">LOKASI</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[5%]">MUTU</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[5%]">SLUMP</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[7%]">VOLUME</TableHead>
                  
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">PASIR</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">BATU</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">SEMEN</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">AIR</TableHead>

                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">PASIR</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">BATU</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">SEMEN</TableHead>
                  <TableHead className="text-center border p-2 font-semibold text-foreground w-[8%]">AIR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {(Object.keys(row) as Array<keyof typeof row>).map(
                      (key) => (
                        <TableCell key={key} className="border p-0 h-10">
                          <Input
                            type="text"
                            value={row[key]}
                            onChange={(e) =>
                              handleInputChange(rowIndex, key, e.target.value)
                            }
                            className="w-full h-full border-none rounded-none text-center"
                            readOnly={['lokasi', 'mutu', 'slump', 'volume'].includes(key) && !!row[key]}
                          />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
