
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Boxes, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-provider';
import type { ProductionHistoryEntry } from '@/lib/types';

interface MaterialStock {
  awal: number;
  pemakaian: number;
}

interface DailyStock {
  pasir: MaterialStock;
  batu: MaterialStock;
  semen: MaterialStock;
}

const initialStock: DailyStock = {
  pasir: { awal: 0, pemakaian: 0 },
  batu: { awal: 0, pemakaian: 0 },
  semen: { awal: 0, pemakaian: 0 },
};

const getStockKey = (date: Date) => `app-stok-material-${format(date, 'yyyy-MM-dd')}`;
const PRODUCTION_HISTORY_KEY = 'app-production-history';

export default function StokMaterialPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [stock, setStock] = useState<DailyStock>(initialStock);
  const [productionHistory, setProductionHistory] = useState<ProductionHistoryEntry[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(PRODUCTION_HISTORY_KEY);
      if (storedHistory) {
        setProductionHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load production history:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const key = getStockKey(date);
      const storedData = localStorage.getItem(key);
      if (storedData) {
        setStock(JSON.parse(storedData));
      } else {
        setStock({
          pasir: { awal: 0, pemakaian: 0 },
          batu: { awal: 0, pemakaian: 0 },
          semen: { awal: 0, pemakaian: 0 },
        });
      }
    } catch (error) {
      console.error("Failed to load stock data:", error);
      setStock(initialStock);
    }
  }, [date]);
  
  const calculatedUsage = useMemo(() => {
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const todaysProduction = productionHistory.filter(
      item => format(new Date(item.startTime), 'yyyy-MM-dd') === selectedDateStr
    );

    const totals = {
      pasir: 0,
      batu: 0,
      semen: 0,
    };

    todaysProduction.forEach(item => {
      totals.pasir += (item.actualWeights?.pasir1 || 0) + (item.actualWeights?.pasir2 || 0);
      totals.batu += (item.actualWeights?.batu1 || 0) + (item.actualWeights?.batu2 || 0);
      totals.semen += item.actualWeights?.semen || 0;
    });

    return {
      pasir: totals.pasir, // Already in Kg
      batu: totals.batu, // Already in Kg
      semen: totals.semen // Already in Kg
    };
  }, [date, productionHistory]);
  
  // Effect to update stock usage when calculatedUsage changes
  useEffect(() => {
    setStock(prev => ({
      ...prev,
      pasir: { ...prev.pasir, pemakaian: calculatedUsage.pasir / 1000 }, // Convert Kg to M³ approx. (assuming 1M³ = 1000Kg is sufficient for this context, though not precise)
      batu: { ...prev.batu, pemakaian: calculatedUsage.batu / 1000 },
      semen: { ...prev.semen, pemakaian: calculatedUsage.semen },
    }));
  }, [calculatedUsage]);


  const handleStockAwalChange = (material: 'pasir' | 'batu' | 'semen', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setStock(prev => ({
      ...prev,
      [material]: {
        ...prev[material],
        awal: numericValue,
      },
    }));
  };

  const handleSave = () => {
    try {
      const key = getStockKey(date);
      localStorage.setItem(key, JSON.stringify(stock));
      toast({
        title: 'Berhasil Disimpan',
        description: `Data stok untuk tanggal ${format(date, 'd MMMM yyyy')} telah disimpan.`,
      });
    } catch (error) {
      console.error("Failed to save stock data:", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan data.',
      });
    }
  };

  const calculateStockAkhir = (material: MaterialStock) => {
    return material.awal - material.pemakaian;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Boxes className="h-6 w-6 text-primary" />
                    Stok Material
                </CardTitle>
                <CardDescription>
                    Kelola stok awal, pemakaian, dan stok akhir material harian.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
                    onSelect={(d) => setDate(d || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold mb-2">Lokasi: <span className="text-primary">{user?.location}</span></p>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%] font-bold text-black">KETERANGAN</TableHead>
                <TableHead className="w-[25%] text-center font-bold text-black">PASIR (M³)</TableHead>
                <TableHead className="w-[25%] text-center font-bold text-black">BATU (M³)</TableHead>
                <TableHead className="w-[25%] text-center font-bold text-black">SEMEN (Kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">STOK AWAL</TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.pasir.awal} onChange={e => handleStockAwalChange('pasir', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.batu.awal} onChange={e => handleStockAwalChange('batu', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.semen.awal} onChange={e => handleStockAwalChange('semen', e.target.value)} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">PEMAKAIAN</TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.pasir.pemakaian.toFixed(2)} readOnly disabled />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.batu.pemakaian.toFixed(2)} readOnly disabled />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.semen.pemakaian.toFixed(2)} readOnly disabled />
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted font-bold">
                <TableCell>STOK AKHIR</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.pasir).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.batu).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.semen).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full md:w-auto ml-auto">
            <Save className="mr-2 h-4 w-4" />
            Simpan Data Stok
        </Button>
      </CardFooter>
    </Card>
  );
}
