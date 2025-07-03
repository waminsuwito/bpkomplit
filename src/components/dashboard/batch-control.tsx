'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JobMixFormula } from '@/components/admin/job-mix-form';

interface ControlPanelProps {
  powerOn: boolean;
  setPowerOn: (on: boolean) => void;
  formulas: JobMixFormula[];
  setTargetWeights: (weights: { aggregate: number; air: number; semen: number }) => void;
  operasiMode: 'MANUAL' | 'AUTO';
  setOperasiMode: (mode: 'MANUAL' | 'AUTO') => void;
  handleProcessControl: (action: 'START' | 'PAUSE' | 'STOP') => void;
}

export function ControlPanel({
  powerOn,
  setPowerOn,
  formulas,
  setTargetWeights,
  operasiMode,
  setOperasiMode,
  handleProcessControl
}: ControlPanelProps) {
  const [selectedFormulaId, setSelectedFormulaId] = useState(formulas[0]?.id || '');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [lokasiProyek, setLokasiProyek] = useState('');
  const [targetVolume, setTargetVolume] = useState(1);
  const [jumlahMixing, setJumlahMixing] = useState(1);
  const [slump, setSlump] = useState(12);

  useEffect(() => {
    const volumePerMix = 3.5;
    if (targetVolume > 0) {
      setJumlahMixing(Math.ceil(targetVolume / volumePerMix));
    } else {
      setJumlahMixing(0);
    }
  }, [targetVolume]);

  useEffect(() => {
    const selectedFormula = formulas.find(f => f.id === selectedFormulaId);
    if (selectedFormula) {
      const scaleFactor = targetVolume > 0 ? targetVolume : 0;
      setTargetWeights({
        aggregate: (selectedFormula.pasir + selectedFormula.batu) * scaleFactor,
        air: selectedFormula.air * scaleFactor,
        semen: selectedFormula.semen * scaleFactor,
      });
    }
  }, [selectedFormulaId, targetVolume, formulas, setTargetWeights]);

  const handleKlaksonPress = (isPressed: boolean) => {
    if (isPressed) {
      console.log('HONK HONK');
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Job Info */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="mutu-beton" className="text-xs text-muted-foreground">MUTU BETON</Label>
            <Select value={selectedFormulaId} onValueChange={setSelectedFormulaId} disabled={!powerOn}>
              <SelectTrigger id="mutu-beton"><SelectValue placeholder="Pilih mutu..." /></SelectTrigger>
              <SelectContent>
                {formulas.map((formula) => (
                  <SelectItem key={formula.id} value={formula.id}>
                    {formula.mutuBeton}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nama-pelanggan" className="text-xs text-muted-foreground">NAMA PELANGGAN</Label>
             <Input id="nama-pelanggan" placeholder="Masukkan nama pelanggan" value={namaPelanggan} onChange={e => setNamaPelanggan(e.target.value)} disabled={!powerOn} />
          </div>
          <div>
            <Label htmlFor="lokasi-proyek" className="text-xs text-muted-foreground">LOKASI PROYEK</Label>
             <Input id="lokasi-proyek" placeholder="Masukkan lokasi proyek" value={lokasiProyek} onChange={e => setLokasiProyek(e.target.value)} disabled={!powerOn} />
          </div>
        </CardContent>
      </Card>
      {/* Target Volume */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-4">
           <div>
            <Label htmlFor="target-volume" className="text-xs text-muted-foreground">TARGET VOLUME (M³)</Label>
            <Input id="target-volume" type="number" value={targetVolume} onChange={(e) => setTargetVolume(Number(e.target.value) > 0 ? Number(e.target.value) : 1)} min="1" disabled={!powerOn} />
          </div>
           <div>
            <Label htmlFor="jumlah-mixing" className="text-xs text-muted-foreground">JUMLAH MIXING</Label>
            <Input id="jumlah-mixing" type="number" value={jumlahMixing} readOnly className="bg-muted/50" />
             <p className="text-xs text-muted-foreground mt-1">Kapasitas mixer: 3.5 M³</p>
          </div>
          <div>
            <Label htmlFor="slump" className="text-xs text-muted-foreground">SLUMP (CM)</Label>
            <Input id="slump" type="number" value={slump} onChange={(e) => setSlump(Number(e.target.value))} disabled={!powerOn}/>
          </div>
        </CardContent>
      </Card>

      {/* Process Controls */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-2">
           <div className="text-center text-primary uppercase text-sm tracking-wider font-semibold mb-2">Mode Operasi</div>
           <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setOperasiMode('MANUAL')} variant={operasiMode === 'MANUAL' ? 'default' : 'secondary'} className="font-bold" disabled={!powerOn}>MANUAL</Button>
              <Button onClick={() => setOperasiMode('AUTO')} variant={operasiMode === 'AUTO' ? 'default' : 'secondary'} className="font-bold" disabled={!powerOn}>AUTO</Button>
           </div>
           <div className="text-center text-primary uppercase text-sm tracking-wider font-semibold pt-4 mb-2">Kontrol Proses</div>
           <div className="grid grid-cols-3 gap-2">
             <Button onClick={() => handleProcessControl('START')} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs col-span-1" disabled={!powerOn || operasiMode === 'MANUAL'}>START</Button>
             <Button onClick={() => handleProcessControl('PAUSE')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs col-span-1" disabled={!powerOn || operasiMode === 'MANUAL'}>PAUSE</Button>
             <Button onClick={() => handleProcessControl('STOP')} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs col-span-1" disabled={!powerOn || operasiMode === 'MANUAL'}>STOP</Button>
           </div>
            <Button 
              onMouseDown={() => handleKlaksonPress(true)} 
              onMouseUp={() => handleKlaksonPress(false)}
              onMouseLeave={() => handleKlaksonPress(false)}
              onTouchStart={() => handleKlaksonPress(true)}
              onTouchEnd={() => handleKlaksonPress(false)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              disabled={!powerOn}
            >
              KLAKSON
            </Button>
            <Button onClick={() => setPowerOn(!powerOn)} className={cn("w-full font-bold", powerOn ? "bg-green-600 hover:bg-green-700 text-white blink" : "bg-red-600 hover:bg-red-700 text-white")}>
                POWER {powerOn ? 'ON' : 'OFF'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
