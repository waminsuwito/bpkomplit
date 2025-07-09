
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { CalendarIcon, Search, Printer, UserX, BarChart3 } from 'lucide-react';
import { getUsers } from '@/lib/auth';
import { printElement } from '@/lib/utils';
import type { User, GlobalAttendanceRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-provider';


const GLOBAL_ATTENDANCE_KEY = 'app-global-attendance-records';

interface DisplayRecord {
  key: string;
  date: string;
  nik: string;
  nama: string;
  location: string;
  status: 'Hadir' | 'Tidak Masuk Kerja';
  absenMasuk: string;
  terlambat: string;
  absenPulang: string;
  lembur: string;
}

export default function RangkumanAbsensiKaryawanPage() {
  const { user: adminUser } = useAuth();
  const [allKaryawan, setAllKaryawan] = useState<User[]>([]);
  const [allAttendance, setAllAttendance] = useState<GlobalAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  
  useEffect(() => {
    try {
        const users = getUsers();
        // Filter karyawan based on admin's location, unless super_admin
        const filteredKaryawan = users.filter(u => 
            u.role === 'karyawan' && 
            (adminUser?.role === 'super_admin' || u.location === adminUser?.location)
        );
        setAllKaryawan(filteredKaryawan);

        const storedData = localStorage.getItem(GLOBAL_ATTENDANCE_KEY);
        if (storedData) {
            setAllAttendance(JSON.parse(storedData));
        }
    } catch (error) {
        console.error("Failed to load data:", error);
    }
  }, [adminUser]);

  const displayRecords = useMemo(() => {
    const records: DisplayRecord[] = [];
    if (!date?.from || !allKaryawan.length) return [];

    const from = startOfDay(date.from);
    const to = date.to ? startOfDay(date.to) : from;
    
    // Iterate through each day in the selected range
    for (let day = from; day <= to; day = addDays(day, 1)) {
        const dateStr = format(day, 'yyyy-MM-dd');

        // Iterate through each employee
        for (const karyawan of allKaryawan) {
            if (!karyawan.nik) continue;

            // Find attendance record for this employee on this day
            const attendanceRecord = allAttendance.find(
                att => att.nik === karyawan.nik && att.date === dateStr
            );
            
            if (attendanceRecord) {
                records.push({
                    key: `${karyawan.nik}-${dateStr}`,
                    date: format(day, 'd MMM yyyy', { locale: localeID }),
                    nik: karyawan.nik,
                    nama: karyawan.username,
                    location: attendanceRecord.location,
                    status: 'Hadir',
                    absenMasuk: attendanceRecord.absenMasuk ? new Date(attendanceRecord.absenMasuk).toLocaleTimeString('id-ID') : '-',
                    terlambat: attendanceRecord.terlambat || '-',
                    absenPulang: attendanceRecord.absenPulang ? new Date(attendanceRecord.absenPulang).toLocaleTimeString('id-ID') : '-',
                    lembur: attendanceRecord.lembur || '-',
                });
            } else {
                 records.push({
                    key: `${karyawan.nik}-${dateStr}`,
                    date: format(day, 'd MMM yyyy', { locale: localeID }),
                    nik: karyawan.nik,
                    nama: karyawan.username,
                    location: karyawan.location || '-',
                    status: 'Tidak Masuk Kerja',
                    absenMasuk: '-',
                    terlambat: '-',
                    absenPulang: '-',
                    lembur: '-',
                });
            }
        }
    }

    // Apply search filter
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredRecords = lowercasedFilter
      ? records.filter(
          (r) =>
            r.nama.toLowerCase().includes(lowercasedFilter) ||
            r.nik.toLowerCase().includes(lowercasedFilter)
        )
      : records;
      
    // Sort by date (descending) then by name (ascending)
    return filteredRecords.sort((a, b) => {
        const dateA = new Date(a.date.split(' ').reverse().join(' ')).getTime();
        const dateB = new Date(b.date.split(' ').reverse().join(' ')).getTime();
        if (dateA !== dateB) {
            return dateB - dateA;
        }
        return a.nama.localeCompare(b.nama);
    });

  }, [date, allKaryawan, allAttendance, searchTerm]);

  return (
    <Card id="print-content">
      <CardHeader className="no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Rangkuman Absensi Karyawan
              </CardTitle>
              <CardDescription>
                Lihat riwayat absensi karyawan. Karyawan yang tidak absen akan ditandai "Tidak Masuk Kerja".
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari NIK atau Nama..."
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
            <h1 className="text-xl font-bold">Rangkuman Absensi Karyawan</h1>
            <p className="text-sm">Lokasi: {adminUser?.location || 'Semua Lokasi'}</p>
            <p className="text-sm">
                Tanggal: {date?.from ? format(date.from, 'd MMM yyyy') : ''}
                {date?.to ? ` - ${format(date.to, 'd MMM yyyy')}` : ''}
            </p>
        </div>
        {displayRecords.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Jam Pulang</TableHead>
                  <TableHead>Terlambat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRecords.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-medium whitespace-nowrap">{item.date}</TableCell>
                    <TableCell>{item.nik}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Hadir' ? 'secondary' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.absenMasuk}</TableCell>
                    <TableCell>{item.absenPulang}</TableCell>
                    <TableCell>{item.terlambat !== '-' ? <Badge variant="destructive">{item.terlambat}</Badge> : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <UserX className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Data</h3>
            <p className="mt-1 text-sm">
                Tidak ada data absensi yang ditemukan untuk filter yang dipilih.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
