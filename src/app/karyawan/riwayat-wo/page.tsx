
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { CalendarIcon, Search, Printer, Inbox, ScrollText } from 'lucide-react';
import { printElement, cn } from '@/lib/utils';
import type { User, TruckChecklistReport, TruckChecklistItem, UserLocation } from '@/lib/types';
import { useAuth } from '@/context/auth-provider';

const WORK_ORDER_STORAGE_KEY = 'app-work-orders';

interface WorkOrder {
  id: string;
  mechanicId: string;
  mechanicName: string;
  vehicle: {
    reportId: string;
    userId: string;
    userNik: string;
    username: string;
    location: UserLocation;
    timestamp: string;
    damagedItems: TruckChecklistItem[];
  };
  startTime: string; // ISO String
  targetCompletionTime: string; // ISO String
  status: 'Menunggu' | 'Dikerjakan' | 'Tunda' | 'Selesai';
  completionTime?: string; // ISO String, set when status becomes 'Selesai'
  notes?: string;
}

export default function RiwayatWoPage() {
  const { user } = useAuth();
  const [allWorkOrders, setAllWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
      if (storedData) {
        const allOrders: WorkOrder[] = JSON.parse(storedData);
        // Sort by most recently completed first
        const completedOrders = allOrders
          .filter(wo => wo.status === 'Selesai' && wo.completionTime)
          .sort((a, b) => new Date(b.completionTime!).getTime() - new Date(a.completionTime!).getTime());
        setAllWorkOrders(completedOrders);
      }
    } catch (error) {
      console.error("Failed to load work order history:", error);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    let filtered = allWorkOrders;

    // Filter by date range
    if (date?.from && date.to) {
      const from = startOfDay(date.from);
      const to = startOfDay(date.to);
      filtered = filtered.filter(wo => {
        const completionDate = startOfDay(new Date(wo.completionTime!));
        return completionDate >= from && completionDate <= to;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.mechanicName.toLowerCase().includes(lowercasedFilter) ||
          r.vehicle.username.toLowerCase().includes(lowercasedFilter) ||
          r.vehicle.userNik.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    return filtered;
  }, [allWorkOrders, searchTerm, date]);
  
  return (
    <Card id="print-content">
      <CardHeader className="no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-6 w-6 text-primary" />
                Riwayat Work Order (WO)
              </CardTitle>
              <CardDescription>
                Lihat riwayat semua pekerjaan perbaikan yang telah selesai.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari mekanik atau operator..."
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full md:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "d LLL, y")} -{" "}
                            {format(date.to, "d LLL, y")}
                            </>
                        ) : (
                            format(date.from, "d LLL, y")
                        )
                        ) : (
                        <span>Pilih rentang tanggal</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={localeID}
                    />
                    </PopoverContent>
                </Popover>
                 <Button onClick={() => printElement('print-content')}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="print-only mb-6 text-center">
            <h1 className="text-xl font-bold">Riwayat Work Order</h1>
            <p className="text-sm">
                Tanggal: {date?.from ? format(date.from, 'd MMM yyyy') : 'Semua'}
                {date?.to ? ` - ${format(date.to, 'd MMM yyyy')}` : ''}
            </p>
        </div>
        {filteredRecords.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Tgl. Selesai</TableHead>
                    <TableHead>Mekanik</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>NIK Kendaraan</TableHead>
                    <TableHead>Detail Kerusakan</TableHead>
                    <TableHead>Target Selesai</TableHead>
                    <TableHead>Keterangan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRecords.map((item) => {
                      const targetDate = new Date(item.targetCompletionTime);
                      const isTargetDateValid = isValid(targetDate);
                      return (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium whitespace-nowrap">{format(new Date(item.completionTime!), 'd MMM yyyy, HH:mm')}</TableCell>
                            <TableCell>{item.mechanicName}</TableCell>
                            <TableCell>{item.vehicle.username}</TableCell>
                            <TableCell>{item.vehicle.userNik}</TableCell>
                            <TableCell>
                              <ul className="list-disc pl-4 space-y-1 text-xs">
                                {item.vehicle.damagedItems.map(d => (
                                    <li key={d.id}>{d.label}: {d.notes || 'Tidak ada catatan'}</li>
                                ))}
                              </ul>
                            </TableCell>
                            <TableCell className="text-xs">
                              {isTargetDateValid ? format(targetDate, 'd MMM, HH:mm') : '-'}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">{item.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
                </Table>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <Inbox className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Riwayat</h3>
            <p className="mt-1 text-sm">
                Tidak ada riwayat WO yang cocok dengan filter yang dipilih.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
