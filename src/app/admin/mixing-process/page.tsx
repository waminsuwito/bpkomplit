'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MixingProcessForm, type MixingProcessConfig } from '@/components/admin/mixing-process-form';

export default function MixingProcessPage() {
  const [mixingProcess, setMixingProcess] = useState<MixingProcessConfig>({
    steps: [
      { id: 'aggregates', name: 'Pasir & Batu', order: 1, delay: 0 },
      { id: 'water', name: 'Air', order: 1, delay: 7 },
      { id: 'semen', name: 'Semen', order: 2, delay: 0 },
    ],
  });

  const handleSaveMixingProcess = (newProcess: MixingProcessConfig) => {
    setMixingProcess(newProcess);
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
              <MixingProcessForm 
                  process={mixingProcess}
                  onSave={handleSaveMixingProcess}
              />
          </CardContent>
      </Card>
    </div>
  );
}
