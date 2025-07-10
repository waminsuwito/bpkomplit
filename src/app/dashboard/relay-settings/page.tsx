
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RELAY_SETTINGS_KEY = 'app-relay-settings';

const controlKeys = [
  'pasir1', 'pasir2', 'batu1', 'batu2', 'airTimbang', 'airBuang',
  'semenTimbang', 'semen', 'pintuBuka', 'pintuTutup', 'konveyorBawah',
  'konveyorAtas', 'klakson'
] as const;

type ControlKey = typeof controlKeys[number];
type RelaySettings = Partial<Record<ControlKey, string>>;

const formatLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export default function RelaySettingsPage() {
  const [settings, setSettings] = useState<RelaySettings>({});
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(RELAY_SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load relay settings:", error);
    }
  }, []);

  const handleInputChange = (key: ControlKey, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Autosave on change
    try {
        localStorage.setItem(RELAY_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
        console.error("Failed to save relay settings:", error);
    }
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem(RELAY_SETTINGS_KEY, JSON.stringify(settings));
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
                    Setting Relay
                </CardTitle>
                <CardDescription>
                    Tetapkan nama relay untuk setiap tombol kontrol manual. Perubahan disimpan secara otomatis.
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
                <TableHead className="w-1/3">Tombol Kontrol</TableHead>
                <TableHead>Nama Relay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controlKeys.map((key) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">
                    {formatLabel(key)}
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder={`Contoh: Relay ${key}`}
                      value={settings[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
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
