'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MixingProcessForm, type MixingProcessConfig } from '@/components/admin/mixing-process-form';

export default function MixingProcessPage() {
  const [mixingProcess, setMixingProcess] = useState<MixingProcessConfig>({
    steps: [
      { id: 'aggregates', name: 'Pasir & Batu', delay: 7 },
      { id: 'water', name: 'Air', delay: 3 },
      { id: 'semen', name: 'Semen & Mixing', delay: 60 },
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
              <CardDescription>Atur urutan dan jeda waktu untuk proses mixing otomatis.</CardDescription>
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
