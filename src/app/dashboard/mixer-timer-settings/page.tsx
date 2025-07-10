
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, ArrowLeft, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MIXER_TIMER_CONFIG_KEY, defaultMixerTimerConfig } from '@/lib/config';
import type { MixerTimerConfig } from '@/lib/config';


const timerFields: { key: keyof MixerTimerConfig, label: string }[] = [
    { key: 'open1_s', label: 'Waktu Buka Pintu ke-1' },
    { key: 'pause1_s', label: 'Waktu Jeda setelah Buka ke-1' },
    { key: 'open2_s', label: 'Waktu Buka Pintu ke-2' },
    { key: 'pause2_s', label: 'Waktu Jeda setelah Buka ke-2' },
    { key: 'open3_s', label: 'Waktu Buka Pintu ke-3' },
    { key: 'pause3_s', label: 'Waktu Jeda setelah Buka ke-3' },
    { key: 'close_s', label: 'Waktu Tutup Pintu' },
];

export default function MixerTimerSettingsPage() {
  const [config, setConfig] = useState<MixerTimerConfig>(defaultMixerTimerConfig);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedConfig = window.localStorage.getItem(MIXER_TIMER_CONFIG_KEY);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error("Failed to load mixer timer config from localStorage", error);
    }
  }, []);

  const handleSettingChange = (key: keyof MixerTimerConfig, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setConfig(prev => ({ ...prev, [key]: numericValue }));
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(MIXER_TIMER_CONFIG_KEY, JSON.stringify(config));
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Pengaturan timer pintu mixer telah berhasil disimpan.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal menyimpan pengaturan timer.',
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-primary" />
              Pengaturan Timer Pintu Mixer
            </CardTitle>
            <CardDescription>
              Atur durasi (dalam detik) untuk setiap tahapan proses bongkar muat mixer.
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
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Tahapan Proses</TableHead>
                <TableHead className="text-center">Durasi (Detik)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timerFields.map((field) => (
                <TableRow key={field.key}>
                  <TableCell className="font-medium">
                    <Label htmlFor={field.key}>{field.label}</Label>
                  </TableCell>
                  <TableCell>
                    <Input
                      id={field.key}
                      type="number"
                      min="0"
                      value={config[field.key]}
                      onChange={(e) => handleSettingChange(field.key, e.target.value)}
                      className="max-w-xs mx-auto text-center"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
            Catatan: "Waktu Buka Pintu" adalah durasi pintu mixer akan terbuka. "Waktu Jeda" adalah waktu tunggu sebelum tahap berikutnya dimulai.
        </p>
      </CardContent>
    </Card>
  );
}
