
'use client';

import { useState, useEffect } from 'react';
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

export default function StokMaterialPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [stock, setStock] = useState<DailyStock>(initialStock);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const key = getStockKey(date);
      const storedData = localStorage.getItem(key);
      if (storedData) {
        setStock(JSON.parse(storedData));
      } else {
        setStock(initialStock);
      }
    } catch (error) {
      console.error("Failed to load stock data:", error);
      setStock(initialStock);
    }
  }, [date]);

  const handleStockChange = (material: 'pasir' | 'batu' | 'semen', type: 'awal' | 'pemakaian', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setStock(prev => ({
      ...prev,
      [material]: {
        ...prev[material],
        [type]: numericValue,
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
                  <Input type="number" className="text-center" value={stock.pasir.awal} onChange={e => handleStockChange('pasir', 'awal', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.batu.awal} onChange={e => handleStockChange('batu', 'awal', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.semen.awal} onChange={e => handleStockChange('semen', 'awal', e.target.value)} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">PEMAKAIAN</TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.pasir.pemakaian} onChange={e => handleStockChange('pasir', 'pemakaian', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.batu.pemakaian} onChange={e => handleStockChange('batu', 'pemakaian', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" className="text-center" value={stock.semen.pemakaian} onChange={e => handleStockChange('semen', 'pemakaian', e.target.value)} />
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted font-bold">
                <TableCell>STOK AKHIR</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.pasir).toLocaleString()}</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.batu).toLocaleString()}</TableCell>
                <TableCell className="text-center text-lg">{calculateStockAkhir(stock.semen).toLocaleString()}</TableCell>
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
