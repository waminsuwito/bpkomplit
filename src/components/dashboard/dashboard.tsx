
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './control-panel';
import { StatusPanel, type TimerDisplayState } from './status-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintPreview } from './print-preview';
import { ScheduleSheet } from './schedule-sheet';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MIXING_PROCESS_STORAGE_KEY, defaultMixingProcess, MIXER_TIMER_CONFIG_KEY, defaultMixerTimerConfig } from '@/lib/config';
import type { MixingProcessConfig, MixerTimerConfig } from '@/lib/config';
import { useAuth } from '@/context/auth-provider';
import type { JobMixFormula, ScheduleSheetRow } from '@/lib/types';
import { getFormulas } from '@/lib/formula';
import { app } from '@/lib/firebase'; // Import Firebase app instance
import { useToast } from '@/hooks/use-toast';
import { getScheduleSheetData } from '@/lib/schedule';
import { Button } from '../ui/button';
import { XCircle } from 'lucide-react';


type AutoProcessStep =
  | 'idle'
  | 'paused'
  | 'complete';

// Helper function to generate simulated weights with realistic deviation and specific rounding rules
const generateSimulatedWeight = (target: number, materialType: 'aggregate' | 'cement_water'): number => {
  const deviation = 0.02; // 2%
  const roundingUnit = materialType === 'aggregate' ? 5 : 1;

  // Calculate random weight
  const min = target * (1 - deviation);
  const max = target * (1 + deviation);
  const randomWeight = Math.random() * (max - min) + min;

  // Round the weight and target to the same unit
  let finalWeight = Math.round(randomWeight / roundingUnit) * roundingUnit;
  const roundedTarget = Math.round(target / roundingUnit) * roundingUnit;
  
  // Ensure the final weight is not exactly the target
  if (finalWeight === roundedTarget) {
    finalWeight += (Math.random() < 0.5 ? -roundingUnit : roundingUnit);
  }
  
  return finalWeight;
};


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
  const [scheduleData, setScheduleData] = useState<ScheduleSheetRow[]>([]);
  
  const initialJobInfo = {
    selectedFormulaId: '',
    namaPelanggan: '',
    lokasiProyek: '',
    targetVolume: 1.0,
    jumlahMixing: 1,
    slump: 12,
    mediaCor: '',
  };
  
  const [jobInfo, setJobInfo] = useState(initialJobInfo);
  const [isJobInfoLocked, setIsJobInfoLocked] = useState(false);


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

  // Load static data on mount
  useEffect(() => {
    const loadedFormulas = getFormulas();
    setFormulas(loadedFormulas);
    const loadedSchedule = getScheduleSheetData();
    setScheduleData(loadedSchedule);
  }, []);

  // Effect to set a default formula ID once formulas are loaded
  useEffect(() => {
    if (formulas.length > 0 && !jobInfo.selectedFormulaId) {
      setJobInfo(prev => ({...prev, selectedFormulaId: formulas[0].id}));
    }
  }, [formulas, jobInfo.selectedFormulaId]);

  // Effect to auto-fill job info when formula selection changes
  useEffect(() => {
    if (!jobInfo.selectedFormulaId || !formulas.length) return;

    const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
    if (!selectedFormula) return;

    const matchingSchedule = scheduleData.find(row => row.mutuBeton === selectedFormula.mutuBeton && (row.nama || row.lokasi));
    
    if (matchingSchedule) {
      setJobInfo(prev => ({
        ...prev,
        namaPelanggan: matchingSchedule.nama || '',
        lokasiProyek: matchingSchedule.lokasi || '',
        targetVolume: parseFloat(matchingSchedule.volume) || prev.targetVolume,
        slump: parseFloat(matchingSchedule.slump) || prev.slump,
        mediaCor: matchingSchedule.mediaCor || '',
      }));
      setIsJobInfoLocked(true);
      toast({ title: 'Jadwal Ditemukan', description: `Data untuk ${selectedFormula.mutuBeton} telah dimuat.` });
    } else {
      // If no matching schedule, unlock the fields
      if (isJobInfoLocked) {
        setJobInfo(prev => ({
          ...initialJobInfo,
          selectedFormulaId: prev.selectedFormulaId, // keep the selected formula
        }));
        setIsJobInfoLocked(false);
      }
    }
  }, [jobInfo.selectedFormulaId, formulas, scheduleData]);

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
     // Don't reset jobInfo here, it should be done manually
  }

  const handleResetJob = () => {
    setJobInfo(initialJobInfo);
    setIsJobInfoLocked(false);
    resetStateForNewJob();
    toast({ title: 'Formulir Direset', description: 'Anda sekarang dapat memasukkan data pekerjaan manual.' });
  };

  const handleProcessControl = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (!powerOn) return;

    if (operasiMode === 'AUTO') {
      const db = getDatabase(app);
      const commandRef = ref(db, 'realtime/command');

      if (action === 'START' && (autoProcessStep === 'idle' || autoProcessStep === 'complete')) {
        // --- START OF VALIDATION ---
        if (!jobInfo.selectedFormulaId) {
            toast({ variant: 'destructive', title: 'Gagal Memulai', description: 'Formula mutu beton belum dipilih.' });
            return;
        }
        const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
        if (!selectedFormula) {
            toast({ variant: 'destructive', title: 'Gagal Memulai', description: 'Formula yang dipilih tidak valid.' });
            return;
        }
        if (!jobInfo.targetVolume || jobInfo.targetVolume <= 0) {
          toast({ variant: 'destructive', title: 'Gagal Memulai', description: 'Target Volume harus lebih besar dari 0.' });
          return;
        }
        if (!jobInfo.jumlahMixing || jobInfo.jumlahMixing <= 0) {
          toast({ variant: 'destructive', title: 'Gagal Memulai', description: 'Jumlah Mixing harus lebih besar dari 0.' });
          return;
        }
        // --- END OF VALIDATION ---

        // Calculate target weights right before sending
        const volumePerMix = jobInfo.targetVolume / jobInfo.jumlahMixing;
        const currentTargetWeights = {
            pasir1: selectedFormula.pasir1 * volumePerMix,
            pasir2: selectedFormula.pasir2 * volumePerMix,
            batu1: selectedFormula.batu1 * volumePerMix,
            batu2: selectedFormula.batu2 * volumePerMix,
            air: selectedFormula.air * volumePerMix,
            semen: selectedFormula.semen * volumePerMix,
        };
        
        resetStateForNewJob();
        set(commandRef, {
            action: 'START',
            timestamp: Date.now(),
            jobDetails: {
                ...jobInfo,
                targetWeights: currentTargetWeights,
                mixingTime,
                mixingProcessConfig,
                mixerTimerConfig,
                mutuBeton: selectedFormula.mutuBeton
            }
        });
        setBatchStartTime(new Date());
      } else {
          // For any other action (STOP, PAUSE, or START to resume) in AUTO mode
          set(commandRef, { action, timestamp: Date.now() });
      }
    } else { // MANUAL MODE - Print Simulation
        const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
        if (!selectedFormula) {
          toast({ variant: 'destructive', title: 'Gagal Simulasi', description: 'Pilih formula mutu beton terlebih dahulu.' });
          return;
        }
        
        const volumePerMix = jobInfo.targetVolume / jobInfo.jumlahMixing;
        const currentTargetWeights = {
            pasir1: selectedFormula.pasir1 * volumePerMix,
            pasir2: selectedFormula.pasir2 * volumePerMix,
            batu1: selectedFormula.batu1 * volumePerMix,
            batu2: selectedFormula.batu2 * volumePerMix,
            air: selectedFormula.air * volumePerMix,
            semen: selectedFormula.semen * volumePerMix,
        };

        if (action === 'START') {
            resetStateForNewJob();
            setIsManualProcessRunning(true);
            setBatchStartTime(new Date());
            addLog('Loading manual dimulai', 'text-green-500');
        } else if (action === 'STOP' && isManualProcessRunning) {
            setIsManualProcessRunning(false);
            const endTime = new Date();

            const simulationWeights = {
                pasir1: generateSimulatedWeight(currentTargetWeights.pasir1, 'aggregate'),
                pasir2: generateSimulatedWeight(currentTargetWeights.pasir2, 'aggregate'),
                batu1: generateSimulatedWeight(currentTargetWeights.batu1, 'aggregate'),
                batu2: generateSimulatedWeight(currentTargetWeights.batu2, 'aggregate'),
                air: generateSimulatedWeight(currentTargetWeights.air, 'cement_water'),
                semen: generateSimulatedWeight(currentTargetWeights.semen, 'cement_water'),
            };

            const finalData = {
                ...jobInfo,
                jobId: `SIM-${Date.now().toString().slice(-6)}`,
                mutuBeton: selectedFormula.mutuBeton,
                startTime: batchStartTime,
                endTime: endTime,
                targetWeights: currentTargetWeights,
                actualWeights: simulationWeights
            };
            setCompletedBatchData(finalData);
            setShowPrintPreview(true);
            addLog('Loading manual selesai', 'text-primary');
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
  
  const currentTargetWeights = useMemo(() => {
    const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
    if (selectedFormula && jobInfo.jumlahMixing > 0 && jobInfo.targetVolume > 0) {
      const volumePerMix = jobInfo.targetVolume / jobInfo.jumlahMixing;
      return {
        pasir1: selectedFormula.pasir1 * volumePerMix,
        pasir2: selectedFormula.pasir2 * volumePerMix,
        batu1: selectedFormula.batu1 * volumePerMix,
        batu2: selectedFormula.batu2 * volumePerMix,
        air: selectedFormula.air * volumePerMix,
        semen: selectedFormula.semen * volumePerMix,
      };
    }
    return { pasir1: 0, pasir2: 0, batu1: 0, batu2: 0, air: 0, semen: 0 };
  }, [jobInfo.selectedFormulaId, jobInfo.targetVolume, jobInfo.jumlahMixing, formulas]);

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
            <div className="col-span-12 flex justify-end">
              <Button
                variant="outline"
                onClick={handleResetJob}
                disabled={!isJobInfoLocked}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reset Job & Isi Manual
              </Button>
            </div>
            <div className="col-span-12">
              <WeightDisplayPanel
                aggregateWeight={aggregateWeight}
                airWeight={airWeight}
                semenWeight={semenWeight}
                targetAggregate={currentTargetWeights.pasir1 + currentTargetWeights.pasir2 + currentTargetWeights.batu1 + currentTargetWeights.batu2}
                targetAir={currentTargetWeights.air}
                targetSemen={currentTargetWeights.semen}
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
                isJobInfoLocked={isJobInfoLocked}
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
             <div className="col-span-12">
                <ScheduleSheet />
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
