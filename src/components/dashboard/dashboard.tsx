
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './control-panel';
import { StatusPanel, type TimerDisplayState } from './status-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintPreview } from './print-preview';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MIXING_PROCESS_STORAGE_KEY, defaultMixingProcess, MIXER_TIMER_CONFIG_KEY, defaultMixerTimerConfig } from '@/lib/config';
import type { MixingProcessConfig, MixerTimerConfig } from '@/lib/config';
import { useAuth } from '@/context/auth-provider';
import type { JobMixFormula } from '@/lib/types';
import { getFormulas } from '@/lib/formula';
import { app } from '@/lib/firebase'; // Import Firebase app instance
import { useToast } from '@/hooks/use-toast';

type AutoProcessStep =
  | 'idle'
  | 'paused'
  | 'complete';

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Real-time weights from Firebase
  const [aggregateWeight, setAggregateWeight] = useState(0);
  const [airWeight, setAirWeight] = useState(0);
  const [semenWeight, setSemenWeight] = useState(0);
  const [currentMixNumber, setCurrentMixNumber] = useState(0);
  const [autoProcessStep, setAutoProcessStep] = useState<AutoProcessStep>('idle');

  const [powerOn, setPowerOn] = useState(true);
  const [mixingTime, setMixingTime] = useState(15);
  const [timerDisplay, setTimerDisplay] = useState<TimerDisplayState>({
    value: mixingTime,
    total: mixingTime,
    label: 'Waktu Mixing',
    colorClass: 'text-primary',
  });

  const [formulas, setFormulas] = useState<JobMixFormula[]>([]);
  const [targetWeights, setTargetWeights] = useState({ pasir1: 0, pasir2: 0, batu1: 0, batu2: 0, air: 0, semen: 0 });
  
  const [jobInfo, setJobInfo] = useState({
    selectedFormulaId: '',
    namaPelanggan: 'PT. JAYA KONSTRUKSI',
    lokasiProyek: 'Jalan Sudirman, Pekanbaru',
    targetVolume: 1.0,
    jumlahMixing: 1,
    slump: 12,
  });

  const [mixingProcessConfig, setMixingProcessConfig] = useState<MixingProcessConfig>(defaultMixingProcess);
  const [mixerTimerConfig, setMixerTimerConfig] = useState<MixerTimerConfig>(defaultMixerTimerConfig);
  
  const [operasiMode, setOperasiMode] = useState<'MANUAL' | 'AUTO'>('AUTO');
  const [isManualProcessRunning, setIsManualProcessRunning] = useState(false);
  const [activityLog, setActivityLog] = useState<{ message: string; id: number; color: string; timestamp: string }[]>([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [completedBatchData, setCompletedBatchData] = useState<any>(null);
  const [batchStartTime, setBatchStartTime] = useState<Date | null>(null);

  const addLog = (message: string, color: string = 'text-foreground') => {
      setActivityLog(prev => {
          const newLog = { 
              message, 
              color, 
              id: Date.now() + Math.random(), 
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit'}) 
          };
          const updatedLogs = [...prev, newLog];
          return updatedLogs.slice(-10); // Keep only the last 10 logs
      });
  };

  useEffect(() => {
    if (!powerOn) return;

    const db = getDatabase(app);
    const weightsRef = ref(db, 'realtime/weights');

    const unsubscribeWeights = onValue(weightsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAggregateWeight(data.aggregate || 0);
        setAirWeight(data.air || 0);
        setSemenWeight(data.semen || 0);
      }
    }, (error) => {
      console.error("Firebase weight listener error:", error);
      toast({
        variant: 'destructive',
        title: 'Koneksi Timbangan Gagal',
        description: 'Tidak dapat terhubung ke Realtime Database untuk data timbangan.'
      });
    });

    return () => {
      unsubscribeWeights();
    };
  }, [powerOn, toast]);

  useEffect(() => {
    setFormulas(getFormulas());
  }, []);

  useEffect(() => {
    if (formulas.length > 0 && !jobInfo.selectedFormulaId) {
      setJobInfo(prev => ({...prev, selectedFormulaId: formulas[0].id}));
    }
  }, [formulas, jobInfo.selectedFormulaId]);

  useEffect(() => {
    const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
    if (selectedFormula && jobInfo.jumlahMixing > 0 && jobInfo.targetVolume > 0) {
      const volumePerMix = jobInfo.targetVolume / jobInfo.jumlahMixing;
      setTargetWeights({
        pasir1: selectedFormula.pasir1 * volumePerMix,
        pasir2: selectedFormula.pasir2 * volumePerMix,
        batu1: selectedFormula.batu1 * volumePerMix,
        batu2: selectedFormula.batu2 * volumePerMix,
        air: selectedFormula.air * volumePerMix,
        semen: selectedFormula.semen * volumePerMix,
      });
    } else {
       setTargetWeights({ pasir1: 0, pasir2: 0, batu1: 0, batu2: 0, air: 0, semen: 0 });
    }
  }, [jobInfo.selectedFormulaId, jobInfo.targetVolume, jobInfo.jumlahMixing, formulas]);

  useEffect(() => {
    try {
      const savedProcess = window.localStorage.getItem(MIXING_PROCESS_STORAGE_KEY);
      if (savedProcess) setMixingProcessConfig(JSON.parse(savedProcess));
      const savedTimers = window.localStorage.getItem(MIXER_TIMER_CONFIG_KEY);
      if (savedTimers) setMixerTimerConfig(JSON.parse(savedTimers));
    } catch (error) {
      console.error("Failed to load configs from localStorage", error);
    }
  }, []);
  
  const resetStateForNewJob = () => {
     setAggregateWeight(0);
     setAirWeight(0);
     setSemenWeight(0);
     setCurrentMixNumber(0);
     setActivityLog([]);
     setShowPrintPreview(false);
     setCompletedBatchData(null);
     setBatchStartTime(null);
  }

  const handleProcessControl = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (!powerOn) return;

    if (operasiMode === 'AUTO') {
        const db = getDatabase(app);
        const commandRef = ref(db, 'realtime/command');

        if (action === 'START' && (autoProcessStep === 'idle' || autoProcessStep === 'complete')) {
            const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
            
            if (!selectedFormula) {
                toast({
                    variant: 'destructive',
                    title: 'Gagal Memulai',
                    description: 'Formula mutu beton belum dipilih.',
                });
                return;
            }

            if (!(jobInfo.targetVolume > 0) || !(jobInfo.jumlahMixing > 0)) {
                toast({
                    variant: 'destructive',
                    title: 'Gagal Memulai',
                    description: 'Target Volume dan Jumlah Mixing harus lebih besar dari 0.',
                });
                return;
            }
            
            resetStateForNewJob();
            set(commandRef, {
                action: 'START',
                timestamp: Date.now(),
                jobDetails: {
                    ...jobInfo,
                    targetWeights,
                    mixingTime,
                    mixingProcessConfig,
                    mixerTimerConfig,
                    mutuBeton: selectedFormula.mutuBeton
                }
            });
            setBatchStartTime(new Date());
        } else {
            set(commandRef, { action, timestamp: Date.now() });
        }
    } else { // MANUAL MODE - Print Simulation
        const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
        if (!selectedFormula) {
          toast({ variant: 'destructive', title: 'Gagal Simulasi', description: 'Pilih formula mutu beton terlebih dahulu.' });
          return;
        }

        if (action === 'START') {
            resetStateForNewJob();
            setIsManualProcessRunning(true);
            setBatchStartTime(new Date());
            addLog('Sesi simulasi cetak dimulai.', 'text-green-500');
        } else if (action === 'STOP' && isManualProcessRunning) {
            setIsManualProcessRunning(false);
            const endTime = new Date();

            // For simulation, actual weights will be the same as target weights.
            const simulationWeights = {
                pasir1: targetWeights.pasir1,
                pasir2: targetWeights.pasir2,
                batu1: targetWeights.batu1,
                batu2: targetWeights.batu2,
                air: targetWeights.air,
                semen: targetWeights.semen,
            };

            const finalData = {
                ...jobInfo,
                jobId: `SIM-${Date.now().toString().slice(-6)}`,
                mutuBeton: selectedFormula.mutuBeton,
                startTime: batchStartTime,
                endTime: endTime,
                targetWeights: targetWeights,
                actualWeights: simulationWeights // Use simulation weights
            };
            setCompletedBatchData(finalData);
            setShowPrintPreview(true);
            addLog('Simulasi selesai. Menampilkan pratinjau cetak.', 'text-primary');
        }
    }
  };

  const handleSetPowerOn = (isOn: boolean) => {
    setPowerOn(isOn);
    if (!isOn) {
        handleProcessControl('STOP');
        resetStateForNewJob();
    }
  };

  const [joggingValues, setJoggingValues] = useState({
    aggregate: 200,
    air: 15,
    semen: 20,
  });

   const handleJoggingChange = (material: 'aggregate' | 'air' | 'semen', value: number) => {
    if (!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')) return;
    setJoggingValues(prev => ({
        ...prev,
        [material]: value >= 0 ? value : 0
    }));
  };

  return (
    <div className="space-y-4">
      <>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <WeightDisplayPanel
                aggregateWeight={aggregateWeight}
                airWeight={airWeight}
                semenWeight={semenWeight}
                targetAggregate={targetWeights.pasir1 + targetWeights.pasir2 + targetWeights.batu1 + targetWeights.batu2}
                targetAir={targetWeights.air}
                targetSemen={targetWeights.semen}
                joggingValues={joggingValues}
                onJoggingChange={handleJoggingChange}
                disabled={!powerOn || isManualProcessRunning || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')}
              />
            </div>

            <div className="col-span-9">
              <ControlPanel
                powerOn={powerOn}
                setPowerOn={handleSetPowerOn}
                formulas={formulas}
                operasiMode={operasiMode}
                setOperasiMode={setOperasiMode}
                handleProcessControl={handleProcessControl}
                jobInfo={jobInfo}
                setJobInfo={setJobInfo}
                isManualProcessRunning={isManualProcessRunning}
              />
            </div>
            <div className="col-span-3">
              <StatusPanel 
                log={activityLog}
                timerDisplay={timerDisplay}
                mixingTime={mixingTime}
                setMixingTime={setMixingTime}
                disabled={!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')}
                currentMixInfo={ operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete' ? {
                  current: currentMixNumber,
                  total: jobInfo.jumlahMixing
                } : undefined}
              />
            </div>
          </div>
          
          <Sheet open={showPrintPreview} onOpenChange={setShowPrintPreview}>
            <SheetContent className="w-full sm:max-w-4xl p-0">
                <PrintPreview 
                    data={completedBatchData}
                    onClose={() => setShowPrintPreview(false)} 
                />
            </SheetContent>
          </Sheet>
        </>
    </div>
  );
}
