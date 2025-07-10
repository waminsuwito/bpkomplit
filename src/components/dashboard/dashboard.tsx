
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './control-panel';
import { StatusPanel, type TimerDisplayState } from './status-panel';
import { ManualControlPanel, type ManualControlsState } from './batch-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiAdvisor } from './ai-advisor';
import { PrintPreview } from './print-preview';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MIXING_PROCESS_STORAGE_KEY, defaultMixingProcess } from '@/lib/config';
import type { MixingProcessConfig, MixingProcessStep } from '@/components/admin/mixing-process-form';
import { useAuth } from '@/context/auth-provider';
import type { JobMixFormula } from '@/lib/types';
import { getFormulas } from '@/lib/formula';

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


type AutoProcessStep =
  | 'idle'
  | 'paused'
  | 'weighing-pasir'
  | 'weighing-batu'
  | 'weighing-complete'
  | 'wait_for_weighing'
  | 'discharging'
  | 'mixing'
  | 'unloading_door_open_1'
  | 'unloading_pause_1'
  | 'unloading_door_open_2'
  | 'unloading_pause_2'
  | 'unloading_to_closing_transition'
  | 'unloading_door_close'
  | 'unloading_door_close_final'
  | 'unloading_klakson'
  | 'complete';

type WeighingPhase = 'idle' | 'fast' | 'paused' | 'jogging' | 'done';
type TimerMode = 'idle' | 'mixing' | 'unloading' | 'closing';
type MaterialDischargeStatus = 'pending' | 'active' | 'done';

export function Dashboard() {
  const { isDashboardAdmin } = useAuth();
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

  const [formulas, setFormulas] = useState<JobMixFormula[]>([]);
  const [targetWeights, setTargetWeights] = useState({ pasir: 0, batu: 0, air: 0, semen: 0 });
  const [actualMaterialWeights, setActualMaterialWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });
  
  // Multi-mix state
  const [currentMixNumber, setCurrentMixNumber] = useState(1);
  const [totalActualWeights, setTotalActualWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });
  const [totalTargetWeights, setTotalTargetWeights] = useState({ pasir: 0, batu: 0, semen: 0, air: 0 });

  useEffect(() => {
    setFormulas(getFormulas());
  }, []);


  const [jobInfo, setJobInfo] = useState({
    selectedFormulaId: '',
    namaPelanggan: 'PT. JAYA KONSTRUKSI',
    lokasiProyek: 'Jalan Sudirman, Pekanbaru',
    targetVolume: 1.0,
    jumlahMixing: 1,
    slump: 12,
  });

  useEffect(() => {
    if (formulas.length > 0 && !jobInfo.selectedFormulaId) {
      setJobInfo(prev => ({...prev, selectedFormulaId: formulas[0].id}));
    }
  }, [formulas, jobInfo.selectedFormulaId]);

  const [mixingProcessConfig, setMixingProcessConfig] = useState<MixingProcessConfig>(defaultMixingProcess);
  
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
  const [isManualProcessRunning, setIsManualProcessRunning] = useState(false);
  const [pausedStep, setPausedStep] = useState<AutoProcessStep>('idle');
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  
  const [activityLog, setActivityLog] = useState<{ message: string; id: number; color: string; timestamp: string }[]>([]);
  
  // Print Preview State
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [completedBatchData, setCompletedBatchData] = useState<any>(null);
  const [batchStartTime, setBatchStartTime] = useState<Date | null>(null);

  // Refs for auto mode logic
  const [weighingPhases, setWeighingPhases] = useState<{
    aggregate: WeighingPhase;
    air: WeighingPhase;
    semen: WeighingPhase;
  }>({ aggregate: 'idle', air: 'idle', semen: 'idle' });

  const [dischargeStatus, setDischargeStatus] = useState<Record<MixingProcessStep['id'], MaterialDischargeStatus>>({
    aggregates: 'pending',
    water: 'pending',
    semen: 'pending',
  });
  
  const pauseStartTimeRef = useRef({ aggregate: 0, air: 0, semen: 0 });
  const jogTickRef = useRef(0);
  const dischargeClockRef = useRef(0);
  const dischargeGroupStartTimeRef = useRef(0);
  const currentDischargeGroupRef = useRef(1);
  
  const prevControlsRef = useRef<ManualControlsState>();
  const prevAutoStepRef = useRef<AutoProcessStep>();

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const savedProcess = window.localStorage.getItem(MIXING_PROCESS_STORAGE_KEY);
      if (savedProcess) {
        setMixingProcessConfig(JSON.parse(savedProcess));
      }
    } catch (error) {
      console.error("Failed to load mixing process config from localStorage", error);
    }
  }, []);
  
  const resetAutoProcess = useCallback(() => {
    setAutoProcessStep('idle');
    setIsManualProcessRunning(false);
    setAggregateWeight(0);
    setAirWeight(0);
    setSemenWeight(0);
    setActualMaterialWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
    setWeighingPhases({ aggregate: 'idle', air: 'idle', semen: 'idle' });
    setTimerDisplay({ value: mixingTime, total: mixingTime, label: 'Waktu Mixing', colorClass: 'text-primary' });
    setTimerMode('idle');
    setCurrentMixNumber(1);
    setTotalActualWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
    setBatchStartTime(null);
    setDischargeStatus({ aggregates: 'pending', water: 'pending', semen: 'pending' });
    dischargeClockRef.current = 0;
    dischargeGroupStartTimeRef.current = 0;
    currentDischargeGroupRef.current = 1;
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
    if (!powerOn) return;

    if (action === 'STOP') {
      if (operasiMode === 'AUTO') {
        resetAutoProcess();
      } else {
        if (isManualProcessRunning) {
            setIsManualProcessRunning(false);
            setActivityLog(prev => [...prev, { message: 'Proses manual dihentikan.', id: Date.now(), color: 'text-red-400', timestamp: new Date().toLocaleTimeString('en-GB') }]);
            
            // Generate print preview for manual mode
            const selectedFormula = formulas.find(f => f.id === jobInfo.selectedFormulaId);
            if (!selectedFormula) {
                console.error("No formula selected for manual print.");
                return;
            }
            
            const applyRandomVariation = (value: number, multiple: number) => {
              const variation = (Math.random() - 0.5) * 2 * 0.01; // +/- 1% variation
              const randomizedValue = value * (1 + variation);
              return Math.round(randomizedValue / multiple) * multiple;
            };

            const manualActualWeights = {
              pasir: applyRandomVariation(targetWeights.pasir, 5),
              batu: applyRandomVariation(targetWeights.batu, 5),
              semen: applyRandomVariation(targetWeights.semen, 1),
              air: applyRandomVariation(targetWeights.air, 1),
            };

            setCompletedBatchData({
              jobId: `MANUAL-${Date.now()}`,
              namaPelanggan: jobInfo.namaPelanggan,
              lokasiProyek: jobInfo.lokasiProyek,
              mutuBeton: selectedFormula.mutuBeton,
              targetVolume: jobInfo.targetVolume,
              slump: jobInfo.slump,
              targetWeights: totalTargetWeights, 
              actualWeights: manualActualWeights, 
              startTime: batchStartTime,
              endTime: new Date(),
            });
            setShowPrintPreview(true);
        }
      }
      return;
    }

    if (operasiMode === 'AUTO') {
      if (action === 'START') {
        if (autoProcessStep === 'idle' || autoProcessStep === 'complete') {
          setActivityLog([]);
          resetAutoProcess();
          setShowPrintPreview(false); // Hide previous print preview
          setBatchStartTime(new Date());
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
      }
    } else { // Manual mode logic for START
      if (action === 'START' && !isManualProcessRunning) {
        setIsManualProcessRunning(true);
        setBatchStartTime(new Date());
        setShowPrintPreview(false);
        setCompletedBatchData(null);
        setActivityLog(prev => [...prev, { message: 'Proses manual dimulai.', id: Date.now(), color: 'text-green-400', timestamp: new Date().toLocaleTimeString('en-GB') }]);
      }
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
        'weighing-pasir': (n, t) => `Menimbang Pasir (Mix ${n}/${t})...`,
        'weighing-batu': (n, t) => `Menimbang Batu (Mix ${n}/${t})...`,
        'weighing-complete': (n, t) => `Penimbangan Selesai (Mix ${n}/${t}). Menunggu...`,
        wait_for_weighing: (n, t) => `Menunggu penimbangan untuk Mix ${n}/${t} selesai...`,
        discharging: (n, t) => `Menuang Material ke Mixer (Mix ${n}/${t})...`,
        mixing: (n, t) => `Proses mixing berjalan (Mix ${n}/${t})...`,
        unloading_door_open_1: (n, t) => `Membuka pintu mixer (Mix ${n}/${t}, tahap 1)...`,
        unloading_pause_1: 'Jeda pengosongan...',
        unloading_door_open_2: (n, t) => `Membuka pintu mixer (Mix ${n}/${t}, tahap 2)...`,
        unloading_pause_2: 'Jeda pengosongan akhir...',
        unloading_to_closing_transition: 'Menyiapkan penutupan pintu...',
        unloading_door_close: (n, t) => `Menutup pintu mixer (setelah Mix ${n}/${t})...`,
        unloading_door_close_final: 'Menutup pintu mixer (Final)...',
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
            const mixNumberToLog = (autoProcessStep === 'wait_for_weighing' || autoProcessStep.startsWith('weighing-'))
              ? currentMixNumber + 1
              : currentMixNumber;
            message = messageOrFn(mixNumberToLog > jobInfo.jumlahMixing ? currentMixNumber : mixNumberToLog, jobInfo.jumlahMixing);
        } else {
            message = messageOrFn;
        }

        if (weighingPhases.aggregate === 'jogging' && (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu')) {
            logActivity(`Menimbang Agregat (Lambat, Mix ${currentMixNumber}/${jobInfo.jumlahMixing})...`);
        } else if (autoProcessStep === 'mixing' && jobInfo.jumlahMixing > 1 && currentMixNumber < jobInfo.jumlahMixing) {
            logActivity(`Mencampur Mix ${currentMixNumber}/${jobInfo.jumlahMixing} & Menimbang Mix ${currentMixNumber + 1}/${jobInfo.jumlahMixing}`);
        }
        else {
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
    currentMixNumber,
    jobInfo,
    batchStartTime,
    dischargeStatus,
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
      currentMixNumber,
      jobInfo,
      batchStartTime,
      dischargeStatus,
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
      case 'unloading_door_close_final':
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
            schedule(() => setAutoProcessStep('discharging'), 1000); // Wait 1s before starting discharge
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
            schedule(() => {
                if (currentMixNumber < jobInfo.jumlahMixing) {
                    setAutoProcessStep('unloading_door_close');
                } else {
                    setAutoProcessStep('unloading_to_closing_transition');
                }
            }, 10000);
            break;
        case 'unloading_to_closing_transition':
            schedule(() => setAutoProcessStep('unloading_door_close_final'), 1000);
            break;
        case 'unloading_door_close':
             schedule(() => {
                const { weighingPhases } = autoProcessStateRef.current;
                if (weighingPhases.aggregate === 'done' && weighingPhases.air === 'done' && weighingPhases.semen === 'done') {
                    setCurrentMixNumber(n => n + 1);
                    setDischargeStatus({ aggregates: 'pending', water: 'pending', semen: 'pending' });
                    setAutoProcessStep('discharging');
                } else {
                    setAutoProcessStep('wait_for_weighing');
                }
            }, 5000);
            break;
        case 'unloading_door_close_final':
            schedule(() => setAutoProcessStep('unloading_klakson'), 5000);
            break;
        case 'unloading_klakson':
            schedule(() => {
                const { jobInfo, batchStartTime } = autoProcessStateRef.current;
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
                    startTime: batchStartTime,
                    endTime: new Date(),
                });
                setShowPrintPreview(true);
            }, 2000);
            break;
    }

    return () => {
        if (timer) clearTimeout(timer);
    };
}, [autoProcessStep, powerOn, operasiMode, formulas, currentMixNumber, totalActualWeights, totalTargetWeights, jobInfo.jumlahMixing]);

  // Effect to manage actuators during auto mode post-mixing sequence
  useEffect(() => {
      if (!powerOn || operasiMode !== 'AUTO') {
          return;
      }
      
      const prevStep = prevAutoStepRef.current;
      const isUnloadingStep = autoProcessStep.startsWith('unloading');
      const isFinalMix = currentMixNumber === jobInfo.jumlahMixing;
      
      if (isUnloadingStep) {
          setActiveControls(prev => ({
              ...prev,
              pintuBuka: autoProcessStep === 'unloading_door_open_1' || autoProcessStep === 'unloading_door_open_2',
              pintuTutup: autoProcessStep === 'unloading_door_close' || autoProcessStep === 'unloading_door_close_final',
              klakson: autoProcessStep === 'unloading_klakson' && isFinalMix,
          }));
      } else if (prevStep && prevStep.startsWith('unloading')) {
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
    const simulationShouldStop = ['idle', 'paused', 'complete'].includes(autoProcessStep);
    if (!powerOn || operasiMode !== 'AUTO' || simulationShouldStop) {
      return;
    }

    const interval = setInterval(() => {
      const { 
        autoProcessStep, 
        weighingPhases, 
        targetWeights,
        aggregateWeight,
        airWeight,
        semenWeight,
        joggingValues,
        actualMaterialWeights,
        currentMixNumber,
        jobInfo
      } = autoProcessStateRef.current;

      jogTickRef.current = (jogTickRef.current + UPDATE_INTERVAL) % (JOG_UPDATE_INTERVAL_MS * 2);
      const isJoggingOn = jogTickRef.current < JOG_UPDATE_INTERVAL_MS;

      // --- Weighing Logic (runs if phases are not 'done') ---
      const weighingIsActive = weighingPhases.aggregate !== 'done' || weighingPhases.air !== 'done' || weighingPhases.semen !== 'done';
      if (weighingIsActive) {
          const now = Date.now();
          const nextPhases = { ...weighingPhases };
          let phaseChanged = false;
          
          // AGGREGATE LOGIC
          if (nextPhases.aggregate !== 'done' && (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu' || autoProcessStep === 'mixing' || autoProcessStep.startsWith('unloading') || autoProcessStep === 'wait_for_weighing')) {
              const currentTarget = autoProcessStep === 'weighing-pasir' 
                  ? targetWeights.pasir 
                  : targetWeights.pasir + targetWeights.batu;
              const joggingStartWeight = currentTarget - joggingValues.aggregate;

              if (nextPhases.aggregate === 'fast' && aggregateWeight >= joggingStartWeight) {
                  nextPhases.aggregate = 'paused'; pauseStartTimeRef.current.aggregate = now; phaseChanged = true;
              } else if (nextPhases.aggregate === 'paused' && now - pauseStartTimeRef.current.aggregate > WEIGHING_PAUSE_S * 1000) {
                  nextPhases.aggregate = 'jogging'; phaseChanged = true;
              } else if (nextPhases.aggregate === 'jogging' && aggregateWeight >= currentTarget - AGGREGATE_TOLERANCE_KG) {
                  nextPhases.aggregate = 'done'; phaseChanged = true;
              }
          }

          // AIR LOGIC
          if (nextPhases.air !== 'done') {
            const joggingStartWeight = targetWeights.air - joggingValues.air;
            if (nextPhases.air === 'fast' && airWeight >= joggingStartWeight) {
              nextPhases.air = 'paused'; pauseStartTimeRef.current.air = now; phaseChanged = true;
            } else if (nextPhases.air === 'paused' && now - pauseStartTimeRef.current.air > WEIGHING_PAUSE_S * 1000) {
              nextPhases.air = 'jogging'; phaseChanged = true;
            } else if (nextPhases.air === 'jogging' && airWeight >= targetWeights.air - AIR_TOLERANCE_KG) {
              setActualMaterialWeights(prev => ({ ...prev, air: airWeight }));
              nextPhases.air = 'done'; phaseChanged = true;
            }
          }
          
          // SEMEN LOGIC
          if (nextPhases.semen !== 'done') {
            const joggingStartWeight = targetWeights.semen - joggingValues.semen;
            if (nextPhases.semen === 'fast' && semenWeight >= joggingStartWeight) {
              nextPhases.semen = 'paused'; pauseStartTimeRef.current.semen = now; phaseChanged = true;
            } else if (nextPhases.semen === 'paused' && now - pauseStartTimeRef.current.semen > WEIGHING_PAUSE_S * 1000) {
              nextPhases.semen = 'jogging'; phaseChanged = true;
            } else if (nextPhases.semen === 'jogging' && semenWeight >= targetWeights.semen - SEMEN_TOLERANCE_KG) {
              setActualMaterialWeights(prev => ({ ...prev, semen: semenWeight }));
              nextPhases.semen = 'done'; phaseChanged = true;
            }
          }
      
          if (phaseChanged) {
              setWeighingPhases(nextPhases);
          }

          // --- Step Transition Logic based on Weighing ---
          if (autoProcessStep === 'weighing-pasir' && nextPhases.aggregate === 'done') {
              setActualMaterialWeights(prev => ({ ...prev, pasir: aggregateWeight }));
              setWeighingPhases(prev => ({ ...prev, aggregate: 'fast' })); // Reset for batu
              setAutoProcessStep('weighing-batu');
              return;
          }
          
          const allWeighingDoneForMix = nextPhases.aggregate === 'done' && nextPhases.air === 'done' && nextPhases.semen === 'done';

          if ((autoProcessStep === 'weighing-batu' || autoProcessStep === 'mixing') && allWeighingDoneForMix) {
              const { actualMaterialWeights } = autoProcessStateRef.current;
              const finalMixWeights = { ...actualMaterialWeights, batu: aggregateWeight - actualMaterialWeights.pasir };
              setActualMaterialWeights(finalMixWeights);
              setTotalActualWeights(prev => ({ pasir: prev.pasir + finalMixWeights.pasir, batu: prev.batu + finalMixWeights.batu, semen: prev.semen + finalMixWeights.semen, air: prev.air + finalMixWeights.air }));
              
              if (autoProcessStep === 'weighing-batu') {
                setAutoProcessStep('weighing-complete');
              } else if (autoProcessStep === 'mixing') {
                // This means weighing for the next mix is complete while current mix is happening
                // The process will naturally wait for the current mix to finish before discharging
              }
              return;
          }

          if (autoProcessStep === 'wait_for_weighing' && allWeighingDoneForMix) {
              const { actualMaterialWeights } = autoProcessStateRef.current;
              const finalMixWeights = { ...actualMaterialWeights, batu: aggregateWeight - actualMaterialWeights.pasir };
              setActualMaterialWeights(finalMixWeights);
              setTotalActualWeights(prev => ({ pasir: prev.pasir + finalMixWeights.pasir, batu: prev.batu + finalMixWeights.batu, semen: prev.semen + finalMixWeights.semen, air: prev.air + finalMixWeights.air }));
              setCurrentMixNumber(n => n + 1);
              setDischargeStatus({ aggregates: 'pending', water: 'pending', semen: 'pending' });
              setAutoProcessStep('discharging');
              return;
          }

          // --- Weight Update Simulation ---
          if (weighingPhases.aggregate === 'fast' || (weighingPhases.aggregate === 'jogging' && isJoggingOn)) {
              if (autoProcessStep === 'weighing-pasir' || autoProcessStep === 'weighing-batu' || autoProcessStep === 'mixing' || autoProcessStep.startsWith('unloading') || autoProcessStep === 'wait_for_weighing') {
                setAggregateWeight(w => w + AGGREGATE_RATE * (UPDATE_INTERVAL / 1000));
              }
          }
          if (weighingPhases.air === 'fast' || (weighingPhases.air === 'jogging' && isJoggingOn)) {
              setAirWeight(w => w + AIR_RATE * (UPDATE_INTERVAL / 1000));
          }
          if (weighingPhases.semen === 'fast' || (weighingPhases.semen === 'jogging' && isJoggingOn)) {
            setSemenWeight(w => w + SEMEN_RATE * (UPDATE_INTERVAL / 1000));
          }
      }

      // --- Discharging Logic ---
      if (autoProcessStep === 'discharging') {
        dischargeClockRef.current += UPDATE_INTERVAL;

        const currentGroupNumber = currentDischargeGroupRef.current;
        const groupSteps = mixingProcessConfig.steps.filter(s => s.order === currentGroupNumber);
        const nextGroupSteps = mixingProcessConfig.steps.filter(s => s.order === currentGroupNumber + 1);

        const newDischargeStatus = { ...autoProcessStateRef.current.dischargeStatus };
        let statusChanged = false;

        // Check which materials should start discharging in the current group
        groupSteps.forEach(step => {
            if (newDischargeStatus[step.id] === 'pending' && dischargeClockRef.current >= dischargeGroupStartTimeRef.current + (step.delay * 1000)) {
                newDischargeStatus[step.id] = 'active';
                statusChanged = true;
            }
        });

        if (statusChanged) {
            setDischargeStatus(newDischargeStatus);
        }

        // Reduce weight for active materials
        if (newDischargeStatus.aggregates === 'active') {
            setAggregateWeight(prev => Math.max(0, prev - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (newDischargeStatus.water === 'active') {
            setAirWeight(prev => Math.max(0, prev - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (newDischargeStatus.semen === 'active') {
            setSemenWeight(w => Math.max(0, w - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
        }
        
        // Mark as done when weight is near zero
        if (newDischargeStatus.aggregates === 'active' && autoProcessStateRef.current.aggregateWeight <= 0.1) newDischargeStatus.aggregates = 'done';
        if (newDischargeStatus.water === 'active' && autoProcessStateRef.current.airWeight <= 0.1) newDischargeStatus.water = 'done';
        if (newDischargeStatus.semen === 'active' && autoProcessStateRef.current.semenWeight <= 0.1) newDischargeStatus.semen = 'done';
        
        // Check if current group is finished
        const isGroupFinished = groupSteps.every(s => newDischargeStatus[s.id] === 'done');
        
        if (isGroupFinished) {
            if (nextGroupSteps.length > 0) {
                // Move to next group
                currentDischargeGroupRef.current += 1;
                dischargeGroupStartTimeRef.current = dischargeClockRef.current;
            } else {
                // All groups are done, proceed to mixing
                setTimerMode('mixing'); 
                setAutoProcessStep('mixing');
                
                if (currentMixNumber < jobInfo.jumlahMixing) {
                    // Start weighing the next mix in parallel
                    setWeighingPhases({ aggregate: 'fast', air: 'fast', semen: 'fast' });
                    setAggregateWeight(0);
                    setAirWeight(0);
                    setSemenWeight(0);
                    setActualMaterialWeights({ pasir: 0, batu: 0, semen: 0, air: 0 });
                }
                // Reset discharge state for the next run
                dischargeClockRef.current = 0;
                dischargeGroupStartTimeRef.current = 0;
                currentDischargeGroupRef.current = 1;
                return;
            }
        }
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [powerOn, operasiMode, autoProcessStep, mixingProcessConfig]);


  return (
    <div className="space-y-4">
      <>
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
                isManualProcessRunning={isManualProcessRunning}
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
        </>
    </div>
  );
}
