
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RELAY_MAPPINGS_KEY = 'app-relay-mappings';

const defaultControlKeys = [
  'pasir1', 'pasir2', 'batu1', 'batu2', 'airTimbang', 'airBuang',
  'semenTimbang', 'semen', 'pintuBuka', 'pintuTutup', 'konveyorBawah',
  'konveyorAtas', 'klakson'
] as const;

type ControlKey = typeof defaultControlKeys[number];

export interface ControlMapping {
  id: ControlKey;
  label: string; // User-editable label
  relayName: string;
}

const formatDefaultLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const getInitialMappings = (): ControlMapping[] => {
    return defaultControlKeys.map(key => ({
        id: key,
        label: formatDefaultLabel(key),
        relayName: ''
    }));
};

export default function RelaySettingsPage() {
  const [mappings, setMappings] = useState<ControlMapping[]>(getInitialMappings());
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMappings = localStorage.getItem(RELAY_MAPPINGS_KEY);
      if (storedMappings) {
        setMappings(JSON.parse(storedMappings));
      } else {
        // If nothing is stored, initialize with defaults
        setMappings(getInitialMappings());
      }
    } catch (error) {
      console.error("Failed to load relay settings:", error);
    }
  }, []);

  const handleInputChange = (id: ControlKey, field: 'label' | 'relayName', value: string) => {
    const newMappings = mappings.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    setMappings(newMappings);
    // Autosave on change
    try {
        localStorage.setItem(RELAY_MAPPINGS_KEY, JSON.stringify(newMappings));
    } catch (error) {
        console.error("Failed to save relay settings:", error);
    }
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem(RELAY_MAPPINGS_KEY, JSON.stringify(mappings));
      toast({ title: 'Berhasil', description: 'Semua pengaturan relay telah disimpan.' });
    } catch (error) {
      console.error("Failed to save relay settings:", error);
      toast({ variant: 'destructive', title: 'Gagal', description: 'Tidak dapat menyimpan pengaturan relay.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6 text-primary" />
                    Setting Relay & Label Tombol
                </CardTitle>
                <CardDescription>
                    Kustomisasi nama tombol kontrol dan tetapkan nama relay yang sesuai. Perubahan disimpan otomatis.
                </CardDescription>
            </div>
            <Button onClick={handleSaveAll}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Semua
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Label Tombol (Bisa Diedit)</TableHead>
                <TableHead>Nama Relay (Bisa Diedit)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">
                     <Input
                      placeholder={`Contoh: ${formatDefaultLabel(mapping.id)}`}
                      value={mapping.label}
                      onChange={(e) => handleInputChange(mapping.id, 'label', e.target.value)}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder={`Contoh: Relay ${mapping.id}`}
                      value={mapping.relayName}
                      onChange={(e) => handleInputChange(mapping.id, 'relayName', e.target.value)}
                      className="max-w-xs"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
