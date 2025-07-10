'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, ArrowLeft, Cog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MIXING_PROCESS_STORAGE_KEY, defaultMixingProcess } from '@/lib/config';
import type { MixingProcessConfig, MixingProcessStep } from '@/lib/config';

export default function MixingSettingsPage() {
  const [config, setConfig] = useState<MixingProcessConfig>(defaultMixingProcess);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedProcess = window.localStorage.getItem(MIXING_PROCESS_STORAGE_KEY);
      if (savedProcess) {
        setConfig(JSON.parse(savedProcess));
      }
    } catch (error) {
      console.error("Failed to load mixing process config from localStorage", error);
    }
  }, []);

  const handleSettingChange = (id: MixingProcessStep['id'], field: 'order' | 'delay', value: number) => {
    if (value < 0) return; // Disallow negative numbers
    const newSteps = config.steps.map(step =>
      step.id === id ? { ...step, [field]: value } : step
    );
    setConfig({ steps: newSteps });
  };

  const handleSave = () => {
    try {
      // Basic validation: ensure at least one item is in order 1
      const hasOrderOne = config.steps.some(step => step.order === 1);
      if (!hasOrderOne) {
        toast({
          variant: 'destructive',
          title: 'Konfigurasi Tidak Valid',
          description: 'Setidaknya satu material harus berada di Urutan 1.',
        });
        return;
      }
      localStorage.setItem(MIXING_PROCESS_STORAGE_KEY, JSON.stringify(config));
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Urutan proses mixing telah berhasil disimpan.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal menyimpan pengaturan.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cog className="h-6 w-6 text-primary" />
              Pengaturan Lanjutan: Urutan Mixing
            </CardTitle>
            <CardDescription>
              Atur urutan dan waktu tunda (delay) untuk setiap material dalam proses mixing otomatis.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
              </Link>
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Material dengan nomor urutan yang sama (misal: sama-sama di Urutan 1) akan mulai dituang bersamaan. Anda dapat memberi jeda waktu pada salah satunya menggunakan kolom "Jeda Waktu".
        </p>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Nama Material</TableHead>
                <TableHead className="text-center">Urutan Mixing</TableHead>
                <TableHead className="text-center">Jeda Waktu (Detik)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell className="font-medium">{step.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={step.order}
                      onChange={(e) => handleSettingChange(step.id, 'order', parseInt(e.target.value, 10) || 1)}
                      className="max-w-xs mx-auto text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={step.delay}
                      onChange={(e) => handleSettingChange(step.id, 'delay', parseInt(e.target.value, 10) || 0)}
                      className="max-w-xs mx-auto text-center"
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