'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './batch-control';
import { StatusPanel } from './ai-advisor';
import { ManualControlPanel, type ManualControlsState } from './batch-history';
import type { JobMixFormula } from '@/components/admin/job-mix-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define rates for weight change, units per second
const AGGREGATE_RATE = 250; // kg/s
const AIR_RATE = 50;       // kg/s
const SEMEN_RATE = 100;     // kg/s
const CONVEYOR_DISCHARGE_RATE = 300; // kg/s
const UPDATE_INTERVAL = 100; // ms

// New constants for sophisticated weighing
const FAST_FILL_TARGET_PERCENT = 0.8; // 80%
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
  | 'weighing-aggregates'
  | 'weighing-all'
  | 'weighing-complete'
  | 'discharging-aggregates'
  | 'discharging-water'
  | 'discharging-all'
  | 'complete';
  
type WeighingPhase = 'idle' | 'fast' | 'paused' | 'jogging' | 'done';

export function Dashboard() {
  const [aggregateWeight, setAggregateWeight] = useState(0);
  const [airWeight, setAirWeight] = useState(0);
  const [semenWeight, setSemenWeight] = useState(0);
  const [powerOn, setPowerOn] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mixingTime, setMixingTime] = useState(60);

  const [formulas] = useState<JobMixFormula[]>(initialFormulas);
  const [targetWeights, setTargetWeights] = useState(() => {
    const firstFormula = formulas[0];
    if (firstFormula) {
      return {
        aggregate: firstFormula.pasir + firstFormula.batu,
        air: firstFormula.air,
        semen: firstFormula.semen,
      };
    }
    return { aggregate: 0, air: 0, semen: 0 };
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
  
  const [activityLog, setActivityLog] = useState<{ message: string; id: number; color: string; timestamp: string }[]>([]);
  
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
    setWeighingPhases({ aggregate: 'idle', air: 'idle', semen: 'idle' });
    setCountdown(null);
  }, []);

  const handleSetPowerOn = (isOn: boolean) => {
    if (!isOn) {
      resetAutoProcess();
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
      setActivityLog([]);
    }
    setPowerOn(isOn);
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
  
  const handleProcessControl = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (!powerOn || operasiMode !== 'AUTO') return;

    if (action === 'START') {
      if (autoProcessStep === 'idle' || autoProcessStep === 'complete') {
        setActivityLog([]);
        resetAutoProcess();
        setWeighingPhases({ aggregate: 'fast', air: 'idle', semen: 'idle' });
        setAutoProcessStep('weighing-aggregates');
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
    const autoStepMessages: { [key in AutoProcessStep]: string | null } = {
        idle: null,
        paused: 'Proses dijeda oleh operator.',
        'weighing-aggregates': 'Menimbang Pasir & Batu (Cepat)...',
        'weighing-all': 'Menimbang semua material...',
        'weighing-complete': 'Penimbangan Selesai. Menunggu...',
        'discharging-aggregates': 'Menuang Pasir & Batu...',
        'discharging-water': 'Menuang Air...',
        'discharging-all': 'Menuang Semen & Mixing...',
        complete: 'Proses Batching Selesai.',
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
       if (autoProcessStep === 'weighing-aggregates' && weighingPhases.aggregate === 'jogging') {
        logActivity('Menimbang Pasir & Batu (Lambat)...');
      } else {
        logActivity(autoStepMessages[autoProcessStep]);
      }
    }
    
    prevControlsRef.current = activeControls;
    prevAutoStepRef.current = autoProcessStep;

  }, [activeControls, autoProcessStep, operasiMode, powerOn, weighingPhases.aggregate]);

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

  // Effect for Countdown timer
  useEffect(() => {
    if (autoProcessStep === 'discharging-all' && powerOn && operasiMode === 'AUTO') {
      if (countdown === null) {
        setCountdown(mixingTime);
      }

      if (countdown !== null && countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(c => (c !== null ? c - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        // Final completion check
        const isDischargeComplete = aggregateWeight <= 0.1 && airWeight <= 0.1 && semenWeight <= 0.1;
        if(isDischargeComplete) {
            setAutoProcessStep('complete');
        }
      }
    } else {
      if (countdown !== null) {
        setCountdown(null);
      }
    }
  }, [countdown, autoProcessStep, powerOn, operasiMode, mixingTime, aggregateWeight, airWeight, semenWeight]);

  // 1. Effect for timed state transitions (mostly for discharge sequence)
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || autoProcessStep === 'paused' || autoProcessStep === 'idle') return;

    let timer: NodeJS.Timeout;

    switch (autoProcessStep) {
      case 'weighing-aggregates':
        timer = setTimeout(() => {
          setAutoProcessStep('weighing-all');
          setWeighingPhases(prev => ({...prev, air: 'fast', semen: 'fast' }));
        }, 2000);
        break;
      case 'weighing-complete':
        timer = setTimeout(() => setAutoProcessStep('discharging-aggregates'), 3000);
        break;
      case 'discharging-aggregates':
        timer = setTimeout(() => setAutoProcessStep('discharging-water'), 7000);
        break;
      case 'discharging-water':
        timer = setTimeout(() => setAutoProcessStep('discharging-all'), 10000);
        break;
    }

    return () => clearTimeout(timer);
  }, [autoProcessStep, powerOn, operasiMode]);

  // 2. Effect for weight & discharge simulation
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || ['idle', 'paused', 'complete'].includes(autoProcessStep)) {
      return;
    }

    const interval = setInterval(() => {
      jogTickRef.current = (jogTickRef.current + UPDATE_INTERVAL) % (JOG_UPDATE_INTERVAL_MS * 2);
      const isJoggingOn = jogTickRef.current < JOG_UPDATE_INTERVAL_MS;

      // Weighing simulation
      if (weighingPhases.aggregate === 'fast') setAggregateWeight(w => w + AGGREGATE_RATE * (UPDATE_INTERVAL / 1000));
      if (weighingPhases.aggregate === 'jogging' && isJoggingOn) setAggregateWeight(w => w + AGGREGATE_RATE * (UPDATE_INTERVAL / 1000));

      if (weighingPhases.air === 'fast') setAirWeight(w => w + AIR_RATE * (UPDATE_INTERVAL / 1000));
      if (weighingPhases.air === 'jogging' && isJoggingOn) setAirWeight(w => w + AIR_RATE * (UPDATE_INTERVAL / 1000));

      if (weighingPhases.semen === 'fast') setSemenWeight(w => w + SEMEN_RATE * (UPDATE_INTERVAL / 1000));
      if (weighingPhases.semen === 'jogging' && isJoggingOn) setSemenWeight(w => w + SEMEN_RATE * (UPDATE_INTERVAL / 1000));

      // Discharging simulation
      if (autoProcessStep.startsWith('discharging-')) {
        setAggregateWeight(prev => Math.max(0, prev - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
        if (autoProcessStep === 'discharging-water' || autoProcessStep === 'discharging-all') {
          setAirWeight(prev => Math.max(0, prev - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (autoProcessStep === 'discharging-all') {
          setSemenWeight(w => Math.max(0, w - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
        }
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoProcessStep, powerOn, operasiMode, weighingPhases]);

  // 3. Effect for weighing phase transitions and completion checks
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || !autoProcessStep.startsWith('weighing-')) return;
    
    const now = Date.now();
    let phaseChanged = false;
    const nextPhases = {...weighingPhases};

    const checkPhase = (
        material: 'aggregate' | 'air' | 'semen',
        weight: number,
        target: number,
        tolerance: number
    ) => {
        const phase = nextPhases[material];
        if (phase === 'fast' && weight >= target * FAST_FILL_TARGET_PERCENT) {
            nextPhases[material] = 'paused';
            pauseStartTimeRef.current[material] = now;
            phaseChanged = true;
        } else if (phase === 'paused' && now - pauseStartTimeRef.current[material] > WEIGHING_PAUSE_S * 1000) {
            nextPhases[material] = 'jogging';
            phaseChanged = true;
        } else if (phase === 'jogging' && weight >= target - tolerance) {
            nextPhases[material] = 'done';
            phaseChanged = true;
            if (material === 'aggregate') setAggregateWeight(target);
            if (material === 'air') setAirWeight(target);
            if (material === 'semen') setSemenWeight(target);
        }
    };

    if (nextPhases.aggregate !== 'done') checkPhase('aggregate', aggregateWeight, targetWeights.aggregate, AGGREGATE_TOLERANCE_KG);
    if (autoProcessStep === 'weighing-all') {
        if (nextPhases.air !== 'done') checkPhase('air', airWeight, targetWeights.air, AIR_TOLERANCE_KG);
        if (nextPhases.semen !== 'done') checkPhase('semen', semenWeight, targetWeights.semen, SEMEN_TOLERANCE_KG);
    }
    
    if (phaseChanged) {
        setWeighingPhases(nextPhases);
    }
    
    // Check for overall completion of weighing
    if (
        autoProcessStep === 'weighing-all' &&
        nextPhases.aggregate === 'done' &&
        nextPhases.air === 'done' &&
        nextPhases.semen === 'done'
    ) {
        setAutoProcessStep('weighing-complete');
    }
  }, [aggregateWeight, airWeight, semenWeight, autoProcessStep, powerOn, operasiMode, targetWeights, weighingPhases]);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <WeightDisplayPanel
            aggregateWeight={aggregateWeight}
            airWeight={airWeight}
            semenWeight={semenWeight}
            targetAggregate={targetWeights.aggregate}
            targetAir={targetWeights.air}
            targetSemen={targetWeights.semen}
          />
        </div>

        <div className="col-span-9">
          <ControlPanel
            powerOn={powerOn}
            setPowerOn={handleSetPowerOn}
            formulas={formulas}
            setTargetWeights={setTargetWeights}
            operasiMode={operasiMode}
            setOperasiMode={setOperasiMode}
            handleProcessControl={handleProcessControl}
          />
        </div>
        <div className="col-span-3">
          <StatusPanel 
            log={activityLog}
            countdown={countdown}
            mixingTime={mixingTime}
            setMixingTime={setMixingTime}
            disabled={!powerOn || (operasiMode === 'AUTO' && autoProcessStep !== 'idle' && autoProcessStep !== 'complete')}
          />
        </div>
      </div>

      {operasiMode === 'MANUAL' && (
        <Card className="mt-4">
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
    </div>
  );
}
