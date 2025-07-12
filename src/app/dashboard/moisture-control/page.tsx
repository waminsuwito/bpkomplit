
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Droplets, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFormulas, type JobMixFormula } from '@/lib/formula';

const MOISTURE_CONTENT_STORAGE_KEY = 'app-moisture-content';

type MaterialKey = 'pasir1' | 'pasir2' | 'batu1' | 'batu2';

const materials: { key: MaterialKey; label: string }[] = [
  { key: 'pasir1', label: 'Pasir 1' },
  { key: 'pasir2', label: 'Pasir 2' },
  { key: 'batu1', label: 'Batu 1' },
  { key: 'batu2', label: 'Batu 2' },
];

export default function MoistureControlPage() {
  const [formulas, setFormulas] = useState<JobMixFormula[]>([]);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('');
  const [moisturePercentages, setMoisturePercentages] = useState<Record<MaterialKey, number>>({
    pasir1: 0,
    pasir2: 0,
    batu1: 0,
    batu2: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadedFormulas = getFormulas();
    setFormulas(loadedFormulas);
    if (loadedFormulas.length > 0) {
      setSelectedFormulaId(loadedFormulas[0].id);
    }

    try {
      const storedMc = localStorage.getItem(MOISTURE_CONTENT_STORAGE_KEY);
      if (storedMc) {
        setMoisturePercentages(JSON.parse(storedMc));
      }
    } catch (error) {
      console.error('Failed to load moisture content from localStorage:', error);
    }
  }, []);

  const selectedFormula = formulas.find(f => f.id === selectedFormulaId);

  const handlePercentageChange = (material: MaterialKey, value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setMoisturePercentages(prev => ({
        ...prev,
        [material]: numericValue,
      }));
    }
  };

  const calculateMcAmount = (material: MaterialKey): number => {
    if (!selectedFormula) return 0;
    const materialWeight = selectedFormula[material] || 0;
    const mcPercentage = moisturePercentages[material] || 0;
    return (materialWeight * mcPercentage) / 100;
  };

  const handleSave = () => {
    try {
      localStorage.setItem(MOISTURE_CONTENT_STORAGE_KEY, JSON.stringify(moisturePercentages));
      toast({
        title: 'Berhasil',
        description: 'Nilai Moisture Content (MC) telah disimpan.',
      });
    } catch (error) {
      console.error('Failed to save moisture content:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan data MC.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              Moisture Control (MC)
            </CardTitle>
            <CardDescription>
              Sesuaikan nilai kelembaban material untuk koreksi air pada campuran.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Nilai MC
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-md space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="mutu-beton">Pilih Mutu Beton</Label>
            <Select
              value={selectedFormulaId}
              onValueChange={setSelectedFormulaId}
              disabled={formulas.length === 0}
            >
              <SelectTrigger id="mutu-beton">
                <SelectValue placeholder="Pilih formula..." />
              </SelectTrigger>
              <SelectContent>
                {formulas.map(formula => (
                  <SelectItem key={formula.id} value={formula.id}>
                    {formula.mutuBeton}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Material Sesuai Jobmix</TableHead>
                <TableHead className="text-center">Persentase MC (%)</TableHead>
                <TableHead className="text-center">Angka MC (Kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedFormula ? (
                materials.map(({ key, label }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={moisturePercentages[key]}
                        onChange={e => handlePercentageChange(key, e.target.value)}
                        className="max-w-xs mx-auto text-center"
                        min="0"
                        step="0.1"
                      />
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg text-primary">
                      {calculateMcAmount(key).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Pilih formula mutu beton untuk melihat material.
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
