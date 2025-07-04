'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './batch-control';
import { StatusPanel, type TimerDisplayState } from './status-panel';
import { ManualControlPanel, type ManualControlsState } from './batch-history';
import type { JobMixFormula } from '@/components/admin/job-mix-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiAdvisor } from './ai-advisor';
import { PrintPreview } from './print-preview';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// Define rates for weight change, units per second
const AGGREGATE_RATE = 250; // kg/s
const AIR_RATE = 50;       // kg/s
const SEMEN_RATE = 100;     // kg/s
const CONVEYOR_DISCHARGE_RATE = 300; // kg/s
const UPDATE_INTERVAL = 100; // ms

// New constants for sophisticated weighing
const WEIGHING_PAUSE_S = 2; // seconds
const JOG_UPDATE_INTERVAL_MS = 400; // ms for on/off cycle during jogging
const AGGREGATE_TOLERANCE_KG = 10;
const AIR_TOLERANCE_KG = 5;
const SEMEN_TOLERANCE_KG = 5;

const initialFormulas: JobMixFormula[] = [
  { id: '1', mutuBeton: 'K225', pasir: 765, batu: 1029, air: 215, semen: 371 },
  { id: '2', mutuBeton: 'K300', pasir: 698, batu: 1047, air: 215, semen: 413 },
  { id: '3', mutuBeton: 'K350', pasir: 681, batu: 1021, air: 215, semen: 439 },
];

type AutoProcessStep =
  | 'idle'
  | 'paused'
  | 'weighing-pasir'
  | 'weighing-batu'
  | 'weighing-all'
  | 'weighing-complete'
  | 'discharging-aggregates'
  | 'discharging-water'
  | 'discharging-semen'
  | 'mixing'
  | 'unloading_door_open_1'
  | 'unloading_pause_1'
  | 'unloading_door_open_2'
  | 'unloading_pause_2'
  | 'unloading_to_closing_transition'
  | 'unloading_door_close'
  | 'advance_to_next_mix'
  | 'unloading_klakson'
  | 'complete';

type WeighingPhase = 'idle' | 'fast' | 'paused' | 'jogging' | 'done';
type TimerMode = 'idle' | 'mixing' | 'unloading' | 'closing';

export function Dashboard() {
  const [aggregateWeight, setAggregateWeight] = useState(0);
  const [airWeight, setAirWeight] = useState(0);
  const [semenWeight, setSemenWeight] = useState(0);
  const [powerOn, setPowerOn] = useState(true);
  const [mixingTime, setMixingTime] = useState(15);
  const [timerDisplay, setTimerDisplay] = useState<TimerDisplayState>({
    value: mixingTime,
    total: mixingTime,
    label: 'Waktu Mixing',
    colorClass: 'text-primary',
  });

  const [formulas] = useState<JobMixFormula[]>(initialFormulas);
  const [targetWeights, setTargetWeights] = useState({ pasir: 0, batu: 0, air: 0, semen: 0 });
  const [actualMaterialWeights, setActualMaterialWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });
  
  // Multi-mix state
  const [currentMixNumber, setCurrentMixNumber] = useState(1);
  const [totalActualWeights, setTotalActualWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });
  const [totalTargetWeights, setTotalTargetWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });


  const [jobInfo, setJobInfo] = useState({
    selectedFormulaId: formulas[0]?.id || '',
    namaPelanggan: 'PT. JAYA KONSTRUKSI',
    lokasiProyek: 'Jalan Sudirman, Pekanbaru',
    targetVolume: 1.0,
    jumlahMixing: 1,
    slump: 12,
  });
  
  // Effect to update target weights when formula or volume changes
  useEffect(() => {
    const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
    if (selectedFormula && jobInfo.jumlahMixing > 0) {
      const volumePerMix = jobInfo.targetVolume / jobInfo.jumlahMixing;
      setTargetWeights({
        pasir: selectedFormula.pasir * volumePerMix,
        batu: selectedFormula.batu * volumePerMix,
        air: selectedFormula.air * volumePerMix,
        semen: selectedFormula.semen * volumePerMix,
      });
      // Also calculate total targets for the printout
      setTotalTargetWeights({
        pasir: selectedFormula.pasir * jobInfo.targetVolume,
        batu: selectedFormula.batu * jobInfo.targetVolume,
        air: selectedFormula.air * jobInfo.targetVolume,
        semen: selectedFormula.semen * jobInfo.targetVolume,
      });
    }
  }, [jobInfo.selectedFormulaId, jobInfo.targetVolume, jobInfo.jumlahMixing, formulas]);


  const [joggingValues, setJoggingValues] = useState({
    aggregate: 200,
    air: 15,
    semen: 20,
  });

  const [activeControls, setActiveControls] = useState<ManualControlsState>({
    pasir1: false, pasir2: false, batu1: false, batu2: false,
    airTimbang: false, airBuang: false,
    selectedSilo: 'silo1',
    semenTimbang: false,
    semen: false,
    pintuBuka: false, pintuTutup: false, 
    konveyorBawah: false, 
    konveyorAtas: false, 
    klakson: false
  });

  const [operasiMode, setOperasiMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoProcessStep, setAutoProcessStep] = useState<AutoProcessStep>('idle');
  const [pausedStep, setPausedStep] = useState<AutoProcessStep>('idle');
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  
  const [activityLog, setActivityLog] = useState<{ message: string; id: number; color: string; timestamp: string }[]>([]);
  
  // Print Preview State
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [completedBatchData, setCompletedBatchData] = useState<any>(null);

  // Refs for auto mode logic
  const [weighingPhases, setWeighingPhases] = useState<{
    aggregate: WeighingPhase;
    air: WeighingPhase;
    semen: WeighingPhase;
  }>({ aggregate: 'idle', air: 'idle', semen: 'idle' });

  const pauseStartTimeRef = useRef({ aggregate: 0, air: 0, semen: 0 });
  const jogTickRef = useRef(0);
  
  const prevControlsRef = useRef<ManualControlsState>();
  const prevAutoStepRef = useRef<AutoProcessStep>();
  
  const resetAutoProcess = useCallback(() => {
    setAutoProcessStep('idle');
    setAggregateWeight(0);
    setAirWeight(0);
    setSemenWeight(0);
    setActualMaterialWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
    setWeighingPhases({ aggregate: 'idle', air: 'idle', semen: 'idle' });
    setTimerDisplay({ value: mixingTime, total: mixingTime, label: 'Waktu Mixing', colorClass: 'text-primary' });
    setTimerMode('idle');
    setCurrentMixNumber(1);
    setTotalActualWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
    setActiveControls(prev => ({
        ...prev,
        pintuBuka: false,
        pintuTutup: false,
        klakson: false,
    }));
  }, [mixingTime]);

  const handleSetPowerOn = (isOn: boolean) => {
    setPowerOn(isOn);
    if (!isOn) {
      resetAutoProcess();
      setActivityLog([]);
      setActiveControls({
        pasir1: false, pasir2: false, batu1: false, batu2: false,
        airTimbang: false, airBuang: false,
        selectedSilo: 'silo1',
        semenTimbang: false,
        semen: false,
        pintuBuka: false, pintuTutup: false, 
        konveyorBawah: false, 
        konveyorAtas: false, 
        klakson: false
      });
    }
  };

  const handleToggle = useCallback((key: keyof ManualControlsState) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    setActiveControls(prev => {
      if (typeof prev[key] === 'boolean') {
        return { ...prev, [key]: !prev[key] };
      }
      return prev;
    });
  }, [powerOn, operasiMode]);

  const handlePress = useCallback((key: keyof ManualControlsState, isPressed: boolean) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    setActiveControls(prev => {
      if (prev[key] !== isPressed) {
        return { ...prev, [key]: isPressed };
      }
      return prev;
    });
  }, [powerOn, operasiMode]);

  const handleSiloChange = useCallback((silo: string) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    setActiveControls(prev => ({ ...prev, selectedSilo: silo }));
  }, [powerOn, operasiMode]);

  const handleJoggingChange = (material: 'aggregate' | 'air' | 'semen', value: number) => {
    if (!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')) return;
    setJoggingValues(prev => ({
        ...prev,
        [material]: value >= 0 ? value : 0
    }));
  };
  
  const handleProcessControl = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (!powerOn || operasiMode !== 'AUTO') return;

    if (action === 'START') {
      if (autoProcessStep === 'idle' || autoProcessStep === 'complete') {
        setActivityLog([]);
        resetAutoProcess();
        setShowPrintPreview(false); // Hide previous print preview
        setWeighingPhases({ aggregate: 'fast', air: 'fast', semen: 'fast' });
        setAutoProcessStep('weighing-pasir');
      } else if (autoProcessStep === 'paused') {
        setAutoProcessStep(pausedStep);
      }
    } else if (action === 'PAUSE') {
      if (autoProcessStep !== 'paused' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete') {
        setPausedStep(autoProcessStep);
        setAutoProcessStep('paused');
      }
    } else if (action === 'STOP') {
      resetAutoProcess();
      setActivityLog([]);
    }
  };

  // Effect for logging activities
  useEffect(() => {
    const controlLabels: { [key in keyof Omit<ManualControlsState, 'selectedSilo'>]: { on: string; off: string } } = {
        pasir1: { on: 'Menimbang Pasir 1 ON', off: 'Penimbangan Pasir 1 Selesai' },
        pasir2: { on: 'Menimbang Pasir 2 ON', off: 'Penimbangan Pasir 2 Selesai' },
        batu1: { on: 'Menimbang Batu 1 ON', off: 'Penimbangan Batu 1 Selesai' },
        batu2: { on: 'Menimbang Batu 2 ON', off: 'Penimbangan Batu 2 Selesai' },
        airTimbang: { on: 'Mengisi Air Timbang ON', off: 'Pengisian Air Timbang Selesai' },
        airBuang: { on: 'Membuang Air ON', off: 'Pembuangan Air Selesai' },
        semenTimbang: { on: 'Menimbang Semen ON', off: 'Penimbangan Semen Selesai' },
        semen: { on: 'Membuang Semen ON', off: 'Pembuangan Semen Selesai' },
        pintuBuka: { on: 'Membuka Pintu Mixer', off: 'Pintu Mixer Normal' },
        pintuTutup: { on: 'Menutup Pintu Mixer', off: 'Pintu Mixer Normal' },
        konveyorBawah: { on: 'Konveyor Bawah ON', off: 'Konveyor Bawah OFF' },
        konveyorAtas: { on: 'Konveyor Atas ON', off: 'Konveyor Atas OFF' },
        klakson: { on: 'Klakson ON', off: 'Klakson OFF' },
    };
    const autoStepMessages: { [key in AutoProcessStep]: string | ((mixNum: number, totalMixes: number) => string) | null } = {
        idle: null,
        paused: 'Proses dijeda oleh operator.',
        'weighing-pasir': (n, t) => `Menimbang Material (Mix ${n}/${t})...`,
        'weighing-batu': (n, t) => `Melanjutkan Penimbangan Agregat (Mix ${n}/${t})...`,
        'weighing-all': null, // State is not used
        'weighing-complete': (n, t) => `Penimbangan Selesai (Mix ${n}/${t}). Menunggu...`,
        'discharging-aggregates': (n, t) => `Menuang Agregat (Mix ${n}/${t})...`,
        'discharging-water': (n, t) => `Menuang Air (Mix ${n}/${t})...`,
        'discharging-semen': (n, t) => `Menuang Semen (Mix ${n}/${t})...`,
        mixing: (n, t) => `Proses mixing berjalan (Mix ${n}/${t})...`,
        unloading_door_open_1: (n, t) => `Membuka pintu mixer (Mix ${n}/${t}, tahap 1)...`,
        unloading_pause_1: 'Jeda pengosongan...',
        unloading_door_open_2: (n, t) => `Membuka pintu mixer (Mix ${n}/${t}, tahap 2)...`,
        unloading_pause_2: 'Jeda pengosongan akhir...',
        unloading_to_closing_transition: 'Menyiapkan penutupan pintu...',
        unloading_door_close: 'Menutup pintu mixer...',
        advance_to_next_mix: (n, t) => `Mempersiapkan Mix ${n}/${t}...`,
        unloading_klakson: 'Memberi sinyal proses selesai...',
        complete: 'Proses Batching Selesai. Menampilkan pratinjau cetak...',
    };
    
    const logActivity = (message: string | null) => {
      if (!message) return;
      const activityColors = ['text-green-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400', 'text-pink-400', 'text-violet-400'];
      setActivityLog(prevLog => {
        const newEntry = {
          message,
          id: Date.now() + Math.random(),
          color: activityColors[prevLog.length % activityColors.length],
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        const updatedLog = [...prevLog, newEntry];
        return updatedLog.slice(-3);
      });
    };
    
    const prevControls = prevControlsRef.current;
    if (operasiMode === 'MANUAL' && prevControls && powerOn) {
      (Object.keys(controlLabels) as Array<keyof typeof controlLabels>).forEach(key => {
        if (activeControls[key] !== prevControls[key]) {
          logActivity(activeControls[key] ? controlLabels[key].on : controlLabels[key].off);
        }
      });
    }

    const prevAutoStep = prevAutoStepRef.current;
    if (operasiMode === 'AUTO' && prevAutoStep !== autoProcessStep && powerOn) {
        const messageOrFn = autoStepMessages[autoProcessStep];
        let message: string | null = null;
        if (typeof messageOrFn === 'function') {
            message = messageOrFn(currentMixNumber, jobInfo.jumlahMixing);
        } else {
            message = messageOrFn;
        }

        if (weighingPhases.aggregate === 'jogging' && (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu')) {
            logActivity(`Menimbang Agregat (Lambat, Mix ${currentMixNumber}/${jobInfo.jumlahMixing})...`);
        } else {
            logActivity(message);
        }
    }
    
    prevControlsRef.current = activeControls;
    prevAutoStepRef.current = autoProcessStep;

  }, [activeControls, autoProcessStep, operasiMode, powerOn, weighingPhases.aggregate, currentMixNumber, jobInfo.jumlahMixing]);

  // Effect to log mode changes when power is on
  useEffect(() => {
    if (!powerOn) {
        setActivityLog([]);
        return;
    };
    const initialMessage = operasiMode === 'AUTO' ? 'Mode AUTO diaktifkan.' : 'Mode MANUAL diaktifkan.';
    const color = 'text-primary';
    setActivityLog([{
        message: initialMessage,
        id: Date.now(),
        color,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);
  }, [powerOn, operasiMode]);


  // Effect for Manual Mode Weight Simulation
  useEffect(() => {
    if (!powerOn || operasiMode !== 'MANUAL') return;

    const interval = setInterval(() => {
      if (activeControls.pasir1 || activeControls.pasir2 || activeControls.batu1 || activeControls.batu2) {
        setAggregateWeight(w => w + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000)));
      }
      if (activeControls.konveyorBawah || activeControls.konveyorAtas) {
        setAggregateWeight(w => Math.max(0, w - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
      }
      if (activeControls.airTimbang) {
        setAirWeight(w => w + (AIR_RATE * (UPDATE_INTERVAL / 1000)));
      }
      if (activeControls.airBuang) {
        setAirWeight(w => Math.max(0, w - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
      }
      if (activeControls.semenTimbang) {
        setSemenWeight(w => w + (SEMEN_RATE * (UPDATE_INTERVAL / 1000)));
      }
      if (activeControls.semen) {
        setSemenWeight(w => Math.max(0, w - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [powerOn, operasiMode, activeControls]);

  // --- AUTO MODE EFFECTS ---
  
  const autoProcessStateRef = useRef({
    autoProcessStep,
    weighingPhases,
    targetWeights,
    aggregateWeight,
    airWeight,
    semenWeight,
    joggingValues,
    actualMaterialWeights,
  });

  useEffect(() => {
    autoProcessStateRef.current = {
      autoProcessStep,
      weighingPhases,
      targetWeights,
      aggregateWeight,
      airWeight,
      semenWeight,
      joggingValues,
      actualMaterialWeights,
    };
  });

  // Effect for setting timer display based on auto process step
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || autoProcessStep === 'paused') {
      if (autoProcessStep === 'idle' || autoProcessStep === 'complete' || !powerOn) {
         setTimerDisplay({ value: mixingTime, total: mixingTime, label: 'Waktu Mixing', colorClass: 'text-primary' });
         setTimerMode('idle');
      }
      return;
    };

    switch (autoProcessStep) {
      case 'mixing':
        setTimerMode('mixing');
        setTimerDisplay({ value: mixingTime, total: mixingTime, label: 'Waktu Mixing', colorClass: 'text-primary' });
        break;
      case 'unloading_door_open_1':
        if (timerMode !== 'unloading') {
          setTimerMode('unloading');
          const totalUnloadTime = 2 + 5 + 2 + 10; // open1 + pause1 + open2 + pause2
          setTimerDisplay({ value: 0, total: totalUnloadTime, label: 'Pintu Mixer Buka', colorClass: 'text-destructive' });
        }
        break;
      case 'unloading_to_closing_transition':
        setTimerMode('idle'); // This will stop the timer interval
        // Keep the circle full but change the color to green to signal the next phase
        setTimerDisplay(prev => ({
          value: prev.total, // Keep it full
          total: prev.total,
          label: 'Menyiapkan...',
          colorClass: 'text-success', // Pre-emptively change to green
        }));
        break;
      case 'unloading_door_close':
        if (timerMode !== 'closing') {
          setTimerMode('closing');
          const totalCloseTime = 5;
          setTimerDisplay({ value: totalCloseTime, total: totalCloseTime, label: 'Pintu Mixer Tutup', colorClass: 'text-success' });
        }
        break;
      case 'complete':
      case 'idle':
        setTimerMode('idle');
        setTimerDisplay({ value: mixingTime, total: mixingTime, label: 'Waktu Mixing', colorClass: 'text-primary' });
        break;
    }
  }, [autoProcessStep, powerOn, operasiMode, mixingTime, timerMode]);
  
  // Effect for running the timer every second
  useEffect(() => {
    if (timerMode === 'idle' || autoProcessStep === 'paused' || autoProcessStep === 'idle' || !powerOn) return;

    const timer = setInterval(() => {
        setTimerDisplay(prev => {
            if (timerMode === 'mixing' || timerMode === 'closing') { // Countdown
                const newValue = prev.value - 1;
                if (newValue < 0) {
                  if (timerMode === 'mixing') setAutoProcessStep('unloading_door_open_1');
                  return prev;
                }
                return { ...prev, value: newValue };
            } else if (timerMode === 'unloading') { // Count-up
                const newValue = prev.value + 1;
                if (newValue > prev.total) return prev;
                return { ...prev, value: newValue };
            }
            return prev;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerMode, autoProcessStep, powerOn]);

  // Effect for timed state transitions (discharge sequence and unload sequence)
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || autoProcessStep === 'paused' || autoProcessStep === 'idle') return;

    let timer: NodeJS.Timeout | undefined;

    const schedule = (callback: () => void, delay: number) => {
        timer = setTimeout(callback, delay);
    };

    switch (autoProcessStep) {
        case 'weighing-complete':
            schedule(() => setAutoProcessStep('discharging-aggregates'), 3000);
            break;
        case 'discharging-aggregates':
            schedule(() => setAutoProcessStep('discharging-water'), 7000);
            break;
        case 'discharging-water':
            schedule(() => setAutoProcessStep('discharging-semen'), 10000);
            break;
        case 'unloading_door_open_1':
            schedule(() => setAutoProcessStep('unloading_pause_1'), 2000);
            break;
        case 'unloading_pause_1':
            schedule(() => setAutoProcessStep('unloading_door_open_2'), 5000);
            break;
        case 'unloading_door_open_2':
            schedule(() => setAutoProcessStep('unloading_pause_2'), 2000);
            break;
        case 'unloading_pause_2':
            schedule(() => setAutoProcessStep('unloading_to_closing_transition'), 10000);
            break;
        case 'unloading_to_closing_transition':
            schedule(() => setAutoProcessStep('unloading_door_close'), 1000);
            break;
        case 'unloading_door_close':
            schedule(() => setAutoProcessStep('advance_to_next_mix'), 5000);
            break;
        case 'advance_to_next_mix':
            if (currentMixNumber < jobInfo.jumlahMixing) {
                setCurrentMixNumber(prev => prev + 1);
                // Reset scales and weighing state for the next mix
                setAggregateWeight(0);
                setAirWeight(0);
                setSemenWeight(0);
                setActualMaterialWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
                setWeighingPhases({ aggregate: 'fast', air: 'fast', semen: 'fast' });
                setAutoProcessStep('weighing-pasir');
            } else {
                setAutoProcessStep('unloading_klakson');
            }
            break;
        case 'unloading_klakson':
            schedule(() => {
                setAutoProcessStep('complete');
                const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
                setCompletedBatchData({
                    jobId: `JO-${Date.now()}`,
                    namaPelanggan: jobInfo.namaPelanggan,
                    lokasiProyek: jobInfo.lokasiProyek,
                    mutuBeton: selectedFormula?.mutuBeton || 'N/A',
                    targetVolume: jobInfo.targetVolume,
                    slump: jobInfo.slump,
                    targetWeights: totalTargetWeights,
                    actualWeights: totalActualWeights,
                    timestamp: new Date(),
                });
                setShowPrintPreview(true);
            }, 2000);
            break;
    }

    return () => {
        if (timer) clearTimeout(timer);
    };
}, [autoProcessStep, powerOn, operasiMode, formulas, jobInfo, currentMixNumber, totalActualWeights, totalTargetWeights]);

  // Effect to manage actuators during auto mode post-mixing sequence
  useEffect(() => {
      if (!powerOn || operasiMode !== 'AUTO') {
          return;
      }
      
      const prevStep = prevAutoStepRef.current;
      const isUnloadingStep = autoProcessStep.startsWith('unloading') || autoProcessStep === 'advance_to_next_mix';
      const isFinalMix = currentMixNumber === jobInfo.jumlahMixing;
      
      if (isUnloadingStep) {
          setActiveControls(prev => ({
              ...prev,
              pintuBuka: autoProcessStep === 'unloading_door_open_1' || autoProcessStep === 'unloading_door_open_2',
              pintuTutup: autoProcessStep === 'unloading_door_close',
              klakson: autoProcessStep === 'unloading_klakson' && isFinalMix,
          }));
      } else if (prevStep && (prevStep.startsWith('unloading') || prevStep === 'advance_to_next_mix')) {
          setActiveControls(prev => ({
              ...prev,
              pintuBuka: false,
              pintuTutup: false,
              klakson: false,
          }));
      }
  }, [autoProcessStep, operasiMode, powerOn, currentMixNumber, jobInfo.jumlahMixing]);

  // Combined Effect for weight simulation AND phase transitions
  useEffect(() => {
    const interval = setInterval(() => {
      const { 
        autoProcessStep, 
        weighingPhases, 
        targetWeights,
        aggregateWeight,
        airWeight,
        semenWeight,
        joggingValues
      } = autoProcessStateRef.current;

      if (!powerOn || operasiMode !== 'AUTO' || ['idle', 'paused', 'complete'].includes(autoProcessStep) || autoProcessStep.startsWith('unloading') || autoProcessStep === 'advance_to_next_mix') {
        return;
      }
      
      jogTickRef.current = (jogTickRef.current + UPDATE_INTERVAL) % (JOG_UPDATE_INTERVAL_MS * 2);
      const isJoggingOn = jogTickRef.current < JOG_UPDATE_INTERVAL_MS;

      // --- Phase Transition Logic ---
      const now = Date.now();
      const nextPhases = { ...weighingPhases };
      let phaseChanged = false;
      
      if (autoProcessStep.startsWith('weighing-')) {
          // AGGREGATE LOGIC
          if (nextPhases.aggregate !== 'done' && (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu')) {
              const currentTarget = autoProcessStep === 'weighing-pasir' 
                  ? targetWeights.pasir 
                  : targetWeights.pasir + targetWeights.batu;
              
              const joggingStartWeight = currentTarget - joggingValues.aggregate;

              if (nextPhases.aggregate === 'fast' && aggregateWeight >= joggingStartWeight) {
                  nextPhases.aggregate = 'paused';
                  pauseStartTimeRef.current.aggregate = now;
                  phaseChanged = true;
              } else if (nextPhases.aggregate === 'paused' && now - pauseStartTimeRef.current.aggregate > WEIGHING_PAUSE_S * 1000) {
                  nextPhases.aggregate = 'jogging';
                  phaseChanged = true;
              } else if (nextPhases.aggregate === 'jogging' && aggregateWeight >= currentTarget - AGGREGATE_TOLERANCE_KG) {
                  nextPhases.aggregate = 'done';
                  phaseChanged = true;
              }
          }

          // AIR LOGIC (runs in parallel)
          if (nextPhases.air !== 'done') {
            const joggingStartWeight = targetWeights.air - joggingValues.air;
            if (nextPhases.air === 'fast' && airWeight >= joggingStartWeight) {
              nextPhases.air = 'paused'; pauseStartTimeRef.current.air = now; phaseChanged = true;
            } else if (nextPhases.air === 'paused' && now - pauseStartTimeRef.current.air > WEIGHING_PAUSE_S * 1000) {
              nextPhases.air = 'jogging'; phaseChanged = true;
            } else if (nextPhases.air === 'jogging' && airWeight >= targetWeights.air - AIR_TOLERANCE_KG) {
              nextPhases.air = 'done'; phaseChanged = true;
            }
          }
          
          // SEMEN LOGIC (runs in parallel)
          if (nextPhases.semen !== 'done') {
            const joggingStartWeight = targetWeights.semen - joggingValues.semen;
            if (nextPhases.semen === 'fast' && semenWeight >= joggingStartWeight) {
              nextPhases.semen = 'paused'; pauseStartTimeRef.current.semen = now; phaseChanged = true;
            } else if (nextPhases.semen === 'paused' && now - pauseStartTimeRef.current.semen > WEIGHING_PAUSE_S * 1000) {
              nextPhases.semen = 'jogging'; phaseChanged = true;
            } else if (nextPhases.semen === 'jogging' && semenWeight >= targetWeights.semen - SEMEN_TOLERANCE_KG) {
              nextPhases.semen = 'done'; phaseChanged = true;
            }
          }
      }
      
      if (phaseChanged) {
          setWeighingPhases(nextPhases);
      }
      
      // --- Step Transition Logic ---
      
      // Transition from Pasir to Batu
      if (autoProcessStep === 'weighing-pasir' && nextPhases.aggregate === 'done') {
          setActualMaterialWeights(prev => ({ ...prev, pasir: aggregateWeight }));
          setWeighingPhases(prev => ({ ...prev, aggregate: 'fast' })); // Reset for batu
          setAutoProcessStep('weighing-batu');
          return;
      }
      
      // Check for overall completion once we're in the final aggregate step
      if (autoProcessStep === 'weighing-batu' && 
          nextPhases.aggregate === 'done' && 
          nextPhases.air === 'done' && 
          nextPhases.semen === 'done') {
          
          const finalMixWeights = {
            ...autoProcessStateRef.current.actualMaterialWeights, // contains pasir weight
            batu: aggregateWeight - autoProcessStateRef.current.actualMaterialWeights.pasir,
            semen: semenWeight,
            air: airWeight,
          };
          setActualMaterialWeights(finalMixWeights);
          setTotalActualWeights(prev => ({
            pasir: prev.pasir + finalMixWeights.pasir,
            batu: prev.batu + finalMixWeights.batu,
            semen: prev.semen + finalMixWeights.semen,
            air: prev.air + finalMixWeights.air,
          }));
          setAutoProcessStep('weighing-complete');
          return;
      }
      
      const isDischargeFinished = aggregateWeight <= 0.1 && airWeight <= 0.1 && semenWeight <= 0.1;
      if (autoProcessStep.startsWith('discharging-') && isDischargeFinished) {
        setAutoProcessStep('mixing');
        return; 
      }

      // --- Weight Simulation Logic (uses nextPhases to react immediately) ---
      if (nextPhases.aggregate === 'fast' || (nextPhases.aggregate === 'jogging' && isJoggingOn)) {
          if (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu') {
            setAggregateWeight(w => w + AGGREGATE_RATE * (UPDATE_INTERVAL / 1000));
          }
      }

      if (nextPhases.air === 'fast' || (nextPhases.air === 'jogging' && isJoggingOn)) {
          setAirWeight(w => w + AIR_RATE * (UPDATE_INTERVAL / 1000));
      }

      if (nextPhases.semen === 'fast' || (nextPhases.semen === 'jogging' && isJoggingOn)) {
        setSemenWeight(w => w + SEMEN_RATE * (UPDATE_INTERVAL / 1000));
      }

      // Discharging simulation
      if (autoProcessStep.startsWith('discharging-')) {
          setAggregateWeight(prev => Math.max(0, prev - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
          if (autoProcessStep === 'discharging-water' || autoProcessStep === 'discharging-semen') {
            setAirWeight(prev => Math.max(0, prev - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
          }
          if (autoProcessStep === 'discharging-semen') {
            setSemenWeight(w => Math.max(0, w - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
          }
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [powerOn, operasiMode]);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <WeightDisplayPanel
            aggregateWeight={aggregateWeight}
            airWeight={airWeight}
            semenWeight={semenWeight}
            targetAggregate={targetWeights.pasir + targetWeights.batu}
            targetAir={targetWeights.air}
            targetSemen={targetWeights.semen}
            joggingValues={joggingValues}
            onJoggingChange={handleJoggingChange}
            disabled={!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')}
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
          />
        </div>
        <div className="col-span-3">
          <StatusPanel 
            log={activityLog}
            timerDisplay={timerDisplay}
            mixingTime={mixingTime}
            setMixingTime={setMixingTime}
            currentMixInfo={ operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete' ? {
              current: currentMixNumber,
              total: jobInfo.jumlahMixing
            } : undefined}
            disabled={!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')}
          />
        </div>
      </div>

      <div className="space-y-4">
        {operasiMode === 'MANUAL' && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <ManualControlPanel
                activeControls={activeControls}
                handleToggle={handleToggle}
                handlePress={handlePress}
                handleSiloChange={handleSiloChange}
                disabled={!powerOn || operasiMode === 'AUTO'}
              />
            </CardContent>
          </Card>
        )}
        <AiAdvisor />
      </div>

      <Sheet open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <SheetContent className="w-full sm:max-w-4xl p-0">
            <PrintPreview 
                data={completedBatchData}
                onClose={() => setShowPrintPreview(false)} 
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}
