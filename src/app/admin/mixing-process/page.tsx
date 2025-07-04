'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MixingProcessForm, type MixingProcessConfig } from '@/components/admin/mixing-process-form';

export default function MixingProcessPage() {
  const [mixingProcess, setMixingProcess] = useState<MixingProcessConfig>({
    steps: [
      { id: 'aggregates', name: 'Pasir & Batu', startDelay: 0, actionDelay: 7 },
      { id: 'water', name: 'Air', startDelay: 0, actionDelay: 3 },
      { id: 'semen', name: 'Semen & Mixing', startDelay: 0, actionDelay: 60 },
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
                Atur waktu tunda untuk memulai penimbangan dan jeda antar proses penuangan material untuk fleksibilitas yang lebih tinggi.
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
