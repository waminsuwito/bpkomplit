
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
import type { ProductionHistoryEntry, JobMixFormula } from '@/lib/types';


const MATERIAL_LABELS_KEY = 'app-material-labels';
const PRODUCTION_HISTORY_KEY = 'app-production-history';
const STOCK_KEY_PREFIX = 'app-stok-material-';

const defaultMaterialLabels = {
  pasir1: 'Pasir 1', pasir2: 'Pasir 2',
  batu1: 'Batu 1', batu2: 'Batu 2', batu3: 'Batu 3', batu4: 'Batu 4',
  semen: 'Semen', air: 'Air',
  additive1: 'Additive 1', additive2: 'Additive 2', additive3: 'Additive 3',
};

const getStockKey = (date: Date) => `${STOCK_KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;

type MaterialKey = keyof typeof defaultMaterialLabels;
type DailyStock = Record<MaterialKey, { awal: number; pengiriman: number; pemakaian: number }>;

const initialStock: DailyStock = {
  pasir1: { awal: 0, pemakaian: 0, pengiriman: 0 }, pasir2: { awal: 0, pemakaian: 0, pengiriman: 0 },
  batu1: { awal: 0, pemakaian: 0, pengiriman: 0 }, batu2: { awal: 0, pemakaian: 0, pengiriman: 0 },
  batu3: { awal: 0, pemakaian: 0, pengiriman: 0 }, batu4: { awal: 0, pemakaian: 0, pengiriman: 0 },
  semen: { awal: 0, pemakaian: 0, pengiriman: 0 }, air: { awal: 0, pemakaian: 0, pengiriman: 0 },
  additive1: { awal: 0, pemakaian: 0, pengiriman: 0 }, additive2: { awal: 0, pemakaian: 0, pengiriman: 0 },
  additive3: { awal: 0, pemakaian: 0, pengiriman: 0 },
};

const getMaterialConfig = (): typeof defaultMaterialLabels => {
  if (typeof window === 'undefined') return defaultMaterialLabels;
  try {
    const stored = localStorage.getItem(MATERIAL_LABELS_KEY);
    return stored ? { ...defaultMaterialLabels, ...JSON.parse(stored) } : defaultMaterialLabels;
  } catch (e) {
    return defaultMaterialLabels;
  }
}

export default function StokMaterialPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [stock, setStock] = useState<DailyStock>(initialStock);
  const [productionHistory, setProductionHistory] = useState<ProductionHistoryEntry[]>([]);
  const [materialLabels, setMaterialLabels] = useState(defaultMaterialLabels);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      setMaterialLabels(getMaterialConfig());
      const storedHistory = localStorage.getItem(PRODUCTION_HISTORY_KEY);
      if (storedHistory) {
        setProductionHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const key = getStockKey(date);
      const storedData = localStorage.getItem(key);
      if (storedData) {
        setStock({ ...initialStock, ...JSON.parse(storedData) });
      } else {
        setStock(initialStock);
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

    const usage: Record<MaterialKey, number> = { ...initialStock.pasir1 } as any;
    for (const key in initialStock) {
        usage[key as MaterialKey] = 0;
    }

    todaysProduction.forEach(item => {
      for (const key in item.actualWeights) {
        const matKey = key as keyof ProductionHistoryEntry['actualWeights'];
        if (usage.hasOwnProperty(matKey)) {
          usage[matKey as MaterialKey] += item.actualWeights[matKey] || 0;
        }
      }
    });
    
    return usage;
  }, [date, productionHistory]);
  
  useEffect(() => {
    setStock(prev => {
        const newStock = { ...prev };
        for (const key in calculatedUsage) {
            const matKey = key as MaterialKey;
            newStock[matKey] = { ...newStock[matKey], pemakaian: calculatedUsage[matKey] };
        }
        return newStock;
    });
  }, [calculatedUsage]);


  const handleStockChange = (material: MaterialKey, field: 'awal' | 'pengiriman', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setStock(prev => ({
      ...prev,
      [material]: {
        ...prev[material],
        [field]: numericValue,
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

  const calculateStockAkhir = (materialData: { awal: number; pemakaian: number; pengiriman: number }) => {
    const { awal = 0, pemakaian = 0, pengiriman = 0 } = materialData;
    return awal - pemakaian - pengiriman;
  };
  
  const formatStockValue = (value: number): string => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '0';
    // If it's a whole number, display without decimals. Otherwise, show 2 decimal places.
    return numValue % 1 === 0
      ? numValue.toLocaleString('id-ID')
      : numValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const materialOrder: MaterialKey[] = Object.keys(defaultMaterialLabels) as MaterialKey[];

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
                    className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
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
                <TableHead className="w-[15%] font-bold text-white bg-gray-700">KETERANGAN</TableHead>
                {materialOrder.map(key => {
                    let unit = 'Kg';
                    if (key.startsWith('pasir') || key.startsWith('batu')) {
                      unit = 'M³';
                    } else if (key.startsWith('additive')) {
                      unit = 'L';
                    }
                    
                    return (
                        <TableHead key={key} className="text-center font-bold text-white bg-gray-600 min-w-[150px]">
                            {materialLabels[key]} ({unit})
                        </TableHead>
                    );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">STOK AWAL</TableCell>
                {materialOrder.map(key => (
                    <TableCell key={key}>
                        <Input type="number" className="text-center" value={stock[key]?.awal || 0} onChange={e => handleStockChange(key, 'awal', e.target.value)} />
                    </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">PEMAKAIAN</TableCell>
                 {materialOrder.map(key => (
                    <TableCell key={key}>
                        <Input type="number" className="text-center" value={stock[key]?.pemakaian.toFixed(2) || '0.00'} readOnly disabled />
                    </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">PENGIRIMAN</TableCell>
                 {materialOrder.map(key => (
                    <TableCell key={key}>
                        <Input type="number" className="text-center" value={stock[key]?.pengiriman || 0} onChange={e => handleStockChange(key, 'pengiriman', e.target.value)} />
                    </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted font-bold">
                <TableCell>STOK AKHIR</TableCell>
                 {materialOrder.map(key => (
                    <TableCell key={key} className="text-center text-lg">
                        {formatStockValue(calculateStockAkhir(stock[key]))}
                    </TableCell>
                ))}
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
