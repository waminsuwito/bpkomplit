'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ManualControlsState } from './batch-history';

type AutoProcessStep =
  | 'idle'
  | 'paused'
  | 'weighing-aggregates'
  | 'weighing-all'
  | 'weighing-complete'
  | 'discharging-aggregates'
  | 'discharging-water'
  | 'discharging-all'
  | 'complete';

interface StatusPanelProps {
  autoProcessStep: AutoProcessStep;
  operasiMode: 'MANUAL' | 'AUTO';
  activeControls: ManualControlsState;
}

export function StatusPanel({ autoProcessStep, operasiMode, activeControls }: StatusPanelProps) {
    const getStatusMessage = () => {
      if (operasiMode === 'MANUAL') {
        const activeMessages: string[] = [];
        const controlLabels: { [key in keyof Partial<ManualControlsState>]?: string } = {
          pasir1: "Pasir 1",
          pasir2: "Pasir 2",
          batu1: "Batu 1",
          batu2: "Batu 2",
          airTimbang: "Air Timbang",
          airBuang: "Air Buang",
          semenTimbang: "Semen Timbang",
          semen: "Semen Buang",
          pintuBuka: "Pintu Buka",
          pintuTutup: "Pintu Tutup",
          konveyor: "Konveyor",
          klakson: "Klakson",
        };

        (Object.keys(controlLabels) as Array<keyof ManualControlsState>).forEach(key => {
          if (activeControls[key] === true) {
            activeMessages.push(`${controlLabels[key]} ON`);
          }
        });

        if (activeMessages.length > 0) {
          return activeMessages.map((msg, index) => <p key={index}>{msg}</p>);
        }

        return (
            <>
                <p>Mode Operasi: MANUAL</p>
                <p>Menunggu perintah operator...</p>
            </>
        )
      }

    switch (autoProcessStep) {
        case 'idle':
            return <p>AUTO: Siap memulai proses.</p>;
        case 'paused':
            return <p>AUTO: Proses dijeda.</p>;
        case 'weighing-aggregates':
            return <p>AUTO: Menimbang Pasir & Batu...</p>;
        case 'weighing-all':
            return <p>AUTO: Menimbang Air & Semen...</p>;
        case 'weighing-complete':
            return <p>AUTO: Penimbangan Selesai. Menunggu...</p>;
        case 'discharging-aggregates':
            return <p>AUTO: Menuang Pasir & Batu...</p>;
        case 'discharging-water':
            return <p>AUTO: Menuang Air...</p>;
        case 'discharging-all':
            return <p>AUTO: Menuang Semen & Mixing...</p>;
        case 'complete':
            return <p>AUTO: Proses Selesai.</p>;
        default:
            return <p>Sistem dalam keadaan idle.</p>;
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">
          Aktifitas Berjalan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground text-sm h-32 flex flex-col justify-center items-center font-semibold overflow-y-auto">
          {getStatusMessage()}
        </div>
        <Separator className="my-4 bg-primary/20" />
        <div className="text-center text-muted-foreground text-sm">
          <p>Arduino Mega2560 - USB Connected</p>
        </div>
      </CardContent>
    </Card>
  );
}
