'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MixingProcessForm, type MixingProcessConfig } from '@/components/admin/mixing-process-form';
import { MIXING_PROCESS_STORAGE_KEY, defaultMixingProcess } from '@/lib/config';
import { Skeleton } from '@/components/ui/skeleton';

export default function MixingProcessPage() {
  const [mixingProcess, setMixingProcess] = useState<MixingProcessConfig | null>(null);

  useEffect(() => {
    try {
      const savedProcess = window.localStorage.getItem(MIXING_PROCESS_STORAGE_KEY);
      setMixingProcess(savedProcess ? JSON.parse(savedProcess) : defaultMixingProcess);
    } catch (error) {
      console.error("Failed to load mixing process from localStorage", error);
      setMixingProcess(defaultMixingProcess);
    }
  }, []);

  const handleSaveMixingProcess = (newProcess: MixingProcessConfig) => {
    try {
      window.localStorage.setItem(MIXING_PROCESS_STORAGE_KEY, JSON.stringify(newProcess));
      setMixingProcess(newProcess);
    } catch (error) {
      console.error("Failed to save mixing process to localStorage", error);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6 mx-auto">
      <Card>
          <CardHeader>
              <CardTitle>Mixing Proses</CardTitle>
              <CardDescription>
                Atur urutan dan jeda waktu penuangan material. Material dengan 'Urutan Mixing' yang sama akan diproses dalam satu grup. 'Jeda Tuang' adalah waktu tunda dalam detik setelah sebuah grup dimulai.
              </CardDescription>
          </CardHeader>
          <CardContent>
            {mixingProcess ? (
              <MixingProcessForm 
                  process={mixingProcess}
                  onSave={handleSaveMixingProcess}
              />
            ) : (
              <div className="space-y-6">
                 <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center space-x-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                     <div className="flex justify-between items-center space-x-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                     <div className="flex justify-between items-center space-x-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-36" />
                </div>
              </div>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
