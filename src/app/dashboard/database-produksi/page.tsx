
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Printer, Search, Inbox, CalendarIcon, Database } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { printElement, cn } from '@/lib/utils';
import type { ProductionHistoryEntry } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';


const PRODUCTION_HISTORY_KEY = 'app-production-history';

export default function DatabaseProduksiPage() {
    const [history, setHistory] = useState<ProductionHistoryEntry[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<ProductionHistoryEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(PRODUCTION_HISTORY_KEY);
            if (storedHistory) {
                const parsedHistory: ProductionHistoryEntry[] = JSON.parse(storedHistory);
                // Sort by most recent first
                parsedHistory.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setHistory(parsedHistory);
            }
        } catch (error) {
            console.error("Failed to load production history:", error);
            toast({ variant: 'destructive', title: 'Gagal Memuat', description: 'Tidak dapat memuat riwayat produksi.' });
        }
    }, [toast]);

    useEffect(() => {
        let filtered = history;

        // Filter by search term
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.namaPelanggan.toLowerCase().includes(lowercasedFilter) ||
                item.lokasiProyek.toLowerCase().includes(lowercasedFilter) ||
                item.mutuBeton.toLowerCase().includes(lowercasedFilter) ||
                item.noPolisi.toLowerCase().includes(lowercasedFilter) ||
                item.namaSopir.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        // Filter by date
        if (date) {
            const selectedDateStr = format(date, 'yyyy-MM-dd');
            filtered = filtered.filter(item => {
                const itemDateStr = format(new Date(item.startTime), 'yyyy-MM-dd');
                return itemDateStr === selectedDateStr;
            });
        }

        setFilteredHistory(filtered);
    }, [searchTerm, date, history]);
    
    return (
        <Card id="database-produksi-content">
            <CardHeader className="no-print">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Database Produksi
                        </CardTitle>
                        <CardDescription>
                        Lihat dan kelola riwayat data produksi yang telah disimpan.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                         <Button onClick={() => printElement('database-produksi-content')}>
                            <Printer className="mr-2 h-4 w-4" /> Cetak
                        </Button>
                    </div>
                </div>
                 <div className="flex flex-wrap gap-2 mt-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari berdasarkan pelanggan, lokasi, mutu, sopir..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn(
                            'w-[280px] justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Pilih tanggal</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Reset Tanggal</Button>}
                </div>
            </CardHeader>
            <CardContent>
                <div className="print-only text-center mb-4">
                    <h2 className="text-xl font-bold">Laporan Database Produksi</h2>
                    <p className="text-sm">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                    {date && <p className="text-sm">Filter Tanggal: {format(date, 'd MMMM yyyy')}</p>}
                </div>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Jam</TableHead>
                                <TableHead>Lokasi Cor</TableHead>
                                <TableHead>Mutu Beton</TableHead>
                                <TableHead>Slump</TableHead>
                                <TableHead>Volume (M³)</TableHead>
                                <TableHead>No. Polisi</TableHead>
                                <TableHead>Sopir</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map(item => (
                                    <TableRow key={item.jobId}>
                                        <TableCell>{new Date(item.startTime).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell>{new Date(item.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                        <TableCell>{item.lokasiProyek}</TableCell>
                                        <TableCell>{item.mutuBeton}</TableCell>
                                        <TableCell>{item.slump}</TableCell>
                                        <TableCell>{Number(item.targetVolume).toFixed(2)}</TableCell>
                                        <TableCell>{item.noPolisi}</TableCell>
                                        <TableCell>{item.namaSopir}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Inbox className="h-8 w-8"/>
                                            <span>
                                                {history.length === 0 ? "Belum ada riwayat produksi." : "Tidak ada data yang cocok dengan filter Anda."}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
