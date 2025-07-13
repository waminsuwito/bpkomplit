
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database, ArrowLeft, Printer, Trash2, Search, Inbox } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { printElement } from '@/lib/utils';
import type { ProductionHistoryEntry } from '@/lib/types';

const PRODUCTION_HISTORY_KEY = 'app-production-history';

export default function DatabaseProduksiPage() {
    const [history, setHistory] = useState<ProductionHistoryEntry[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<ProductionHistoryEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(PRODUCTION_HISTORY_KEY);
            if (storedHistory) {
                const parsedHistory: ProductionHistoryEntry[] = JSON.parse(storedHistory);
                // Sort by most recent first
                parsedHistory.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setHistory(parsedHistory);
                setFilteredHistory(parsedHistory);
            }
        } catch (error) {
            console.error("Failed to load production history:", error);
            toast({ variant: 'destructive', title: 'Gagal Memuat', description: 'Tidak dapat memuat riwayat produksi.' });
        }
    }, [toast]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = history.filter(item =>
            item.namaPelanggan.toLowerCase().includes(lowercasedFilter) ||
            item.lokasiProyek.toLowerCase().includes(lowercasedFilter) ||
            item.mutuBeton.toLowerCase().includes(lowercasedFilter) ||
            item.noPolisi.toLowerCase().includes(lowercasedFilter) ||
            item.namaSopir.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredHistory(filtered);
    }, [searchTerm, history]);

    const handleDeleteAll = () => {
        try {
            localStorage.removeItem(PRODUCTION_HISTORY_KEY);
            setHistory([]);
            setFilteredHistory([]);
            toast({ variant: 'destructive', title: 'Riwayat Dihapus', description: 'Semua data produksi telah dihapus.' });
        } catch (error) {
            console.error("Failed to delete production history:", error);
            toast({ variant: 'destructive', title: 'Gagal Menghapus', description: 'Tidak dapat menghapus riwayat produksi.' });
        }
    };
    
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
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Semua
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus semua riwayat produksi? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAll}>Ya, Hapus Semua</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <Button onClick={() => printElement('database-produksi-content')}>
                            <Printer className="mr-2 h-4 w-4" /> Cetak
                        </Button>
                    </div>
                </div>
                 <div className="relative mt-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari berdasarkan pelanggan, lokasi, mutu, sopir..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="print-only text-center mb-4">
                    <h2 className="text-xl font-bold">Laporan Database Produksi</h2>
                    <p className="text-sm">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
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
                                        <TableCell>{item.targetVolume.toFixed(2)}</TableCell>
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
                                                {history.length === 0 ? "Belum ada riwayat produksi." : "Tidak ada data yang cocok dengan pencarian Anda."}
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
