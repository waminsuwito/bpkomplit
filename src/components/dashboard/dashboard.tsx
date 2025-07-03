'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './batch-control';
import { StatusPanel } from './ai-advisor';
import { ManualControlPanel, type ManualControlsState } from './batch-history';
import type { JobMixFormula } from '@/components/admin/job-mix-form';

// Define rates for weight change, units per second
const AGGREGATE_RATE = 250; // kg/s
const AIR_RATE = 50;       // kg/s
const SEMEN_RATE = 100;     // kg/s
const CONVEYOR_DISCHARGE_RATE = 300; // kg/s
const UPDATE_INTERVAL = 100; // ms

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

export function Dashboard() {
  const [aggregateWeight, setAggregateWeight] = useState(0);
  const [airWeight, setAirWeight] = useState(0);
  const [semenWeight, setSemenWeight] = useState(0);
  const [powerOn, setPowerOn] = useState(true);

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
    pintuBuka: false, pintuTutup: false, konveyor: false, klakson: false
  });

  const [operasiMode, setOperasiMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoProcessStep, setAutoProcessStep] = useState<AutoProcessStep>('idle');
  const [pausedStep, setPausedStep] = useState<AutoProcessStep>('idle');

  const handleToggle = useCallback((key: keyof ManualControlsState) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    const currentValue = activeControls[key];
    if (typeof currentValue === 'boolean') {
      setActiveControls(prev => ({ ...prev, [key]: !currentValue }));
    }
  }, [powerOn, operasiMode, activeControls]);

  const handlePress = useCallback((key: keyof ManualControlsState, isPressed: boolean) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    if (activeControls[key] !== isPressed) {
      setActiveControls(prev => ({ ...prev, [key]: isPressed }));
    }
  }, [powerOn, operasiMode, activeControls]);

  const handleSiloChange = useCallback((silo: string) => {
    if (!powerOn || operasiMode !== 'MANUAL') return;
    setActiveControls(prev => ({ ...prev, selectedSilo: silo }));
  }, [powerOn, operasiMode]);
  
  const handleProcessControl = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (!powerOn || operasiMode !== 'AUTO') return;

    if (action === 'START') {
      if (autoProcessStep === 'idle' || autoProcessStep === 'complete') {
        setAggregateWeight(0);
        setAirWeight(0);
        setSemenWeight(0);
        setAutoProcessStep('weighing-aggregates');
      } else if (autoProcessStep === 'paused') {
        setAutoProcessStep(pausedStep);
      }
    } else if (action === 'PAUSE') {
      if (autoProcessStep !== 'paused' && autoProcessStep !== 'idle') {
        setPausedStep(autoProcessStep);
        setAutoProcessStep('paused');
      }
    } else if (action === 'STOP') {
      setAutoProcessStep('idle');
      setAggregateWeight(0);
      setAirWeight(0);
      setSemenWeight(0);
    }
  };

  useEffect(() => {
    if (!powerOn) {
      setActiveControls(prev => ({
        ...prev,
        pasir1: false, pasir2: false, batu1: false, batu2: false,
        airTimbang: false, airBuang: false,
        semenTimbang: false, semen: false,
        konveyor: false, klakson: false,
        pintuBuka: false, pintuTutup: false
      }));
      setAggregateWeight(0);
      setAirWeight(0);
      setSemenWeight(0);
      setAutoProcessStep('idle');
      return;
    }
    
    if (operasiMode !== 'MANUAL') return;

    const interval = setInterval(() => {
      setActiveControls(prev => {
        if (prev.pasir1 || prev.pasir2 || prev.batu1 || prev.batu2) {
          setAggregateWeight(w => w + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000)));
        }
        if (prev.konveyor) {
          setAggregateWeight(w => Math.max(0, w - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (prev.airTimbang) {
          setAirWeight(w => w + (AIR_RATE * (UPDATE_INTERVAL / 1000)));
        }
        if (prev.airBuang) {
          setAirWeight(w => Math.max(0, w - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (prev.semenTimbang) {
          setSemenWeight(w => w + (SEMEN_RATE * (UPDATE_INTERVAL / 1000)));
        }
        if (prev.semen) {
          setSemenWeight(w => Math.max(0, w - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
        }
        return prev;
      })

    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [powerOn, operasiMode, activeControls]);

  // --- AUTO MODE EFFECTS ---

  // 1. Effect for timed state transitions
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || autoProcessStep === 'paused' || autoProcessStep === 'idle') return;

    let timer: NodeJS.Timeout;

    switch (autoProcessStep) {
      case 'weighing-aggregates':
        timer = setTimeout(() => setAutoProcessStep('weighing-all'), 2000);
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

  // 2. Effect for weight simulation
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || ['idle', 'paused', 'complete', 'weighing-complete'].includes(autoProcessStep)) {
      return;
    }

    const interval = setInterval(() => {
      // Weighing
      if (autoProcessStep === 'weighing-aggregates' || autoProcessStep === 'weighing-all') {
        setAggregateWeight(prev => Math.min(targetWeights.aggregate, prev + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000))));
        if (autoProcessStep === 'weighing-all') {
          setAirWeight(prev => Math.min(targetWeights.air, prev + (AIR_RATE * (UPDATE_INTERVAL / 1000))));
          setSemenWeight(prev => Math.min(targetWeights.semen, prev + (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
        }
      }

      // Discharging
      if (autoProcessStep.startsWith('discharging-')) {
        setAggregateWeight(prev => Math.max(0, prev - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
        if (autoProcessStep === 'discharging-water' || autoProcessStep === 'discharging-all') {
          setAirWeight(prev => Math.max(0, prev - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
        }
        if (autoProcessStep === 'discharging-all') {
          setSemenWeight(prev => Math.max(0, prev - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
        }
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoProcessStep, powerOn, operasiMode, targetWeights]);

  // 3. Effect for completion checks to trigger state transitions
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO') return;

    if (autoProcessStep === 'weighing-all') {
      const isWeighingComplete =
        aggregateWeight >= targetWeights.aggregate &&
        airWeight >= targetWeights.air &&
        semenWeight >= targetWeights.semen;

      if (isWeighingComplete) {
        setAutoProcessStep('weighing-complete');
      }
    }

    if (autoProcessStep.startsWith('discharging-')) {
      const isDischargeComplete =
        aggregateWeight <= 0.1 &&
        airWeight <= 0.1 &&
        semenWeight <= 0.1;
      
      if (isDischargeComplete) {
        console.log('Auto batch completed!');
        setAggregateWeight(0);
        setAirWeight(0);
        setSemenWeight(0);
        setAutoProcessStep('complete');
      }
    }
  }, [aggregateWeight, airWeight, semenWeight, targetWeights, autoProcessStep, powerOn, operasiMode]);


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
            setPowerOn={setPowerOn}
            formulas={formulas}
            setTargetWeights={setTargetWeights}
            operasiMode={operasiMode}
            setOperasiMode={setOperasiMode}
            handleProcessControl={handleProcessControl}
          />
        </div>
        <div className="col-span-3">
          <StatusPanel autoProcessStep={autoProcessStep} operasiMode={operasiMode} />
        </div>
      </div>

      {operasiMode === 'MANUAL' && (
        <div>
          <h2 className="text-lg font-semibold uppercase text-primary/80 tracking-widest mb-2">
            Manual Controls
          </h2>
          <ManualControlPanel
            activeControls={activeControls}
            handleToggle={handleToggle}
            handlePress={handlePress}
            handleSiloChange={handleSiloChange}
            disabled={!powerOn || operasiMode === 'AUTO'}
          />
        </div>
      )}
    </div>
  );
}
