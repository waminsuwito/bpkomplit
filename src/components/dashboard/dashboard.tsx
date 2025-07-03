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
  const [autoProcessState, setAutoProcessState] = useState<'idle' | 'running' | 'paused'>('idle');


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
      if (autoProcessState === 'idle') {
        setAggregateWeight(0);
        setAirWeight(0);
        setSemenWeight(0);
      }
      setAutoProcessState('running');
    } else if (action === 'PAUSE') {
      setAutoProcessState('paused');
    } else if (action === 'STOP') {
      setAutoProcessState('idle');
      setAggregateWeight(0);
      setAirWeight(0);
      setSemenWeight(0);
    }
  };

  useEffect(() => {
    if (!powerOn) {
      // If power is off, reset all active controls and weights
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
      setAutoProcessState('idle');
      return;
    }
    
    // This effect handles MANUAL mode
    if (operasiMode !== 'MANUAL') return;

    const interval = setInterval(() => {
      // Aggregate Weighing
      setActiveControls(prev => {
        if (prev.pasir1 || prev.pasir2 || prev.batu1 || prev.batu2) {
          setAggregateWeight(w => w + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000)));
        }
        // Conveyor Discharging
        if (prev.konveyor) {
          setAggregateWeight(w => Math.max(0, w - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
        }
  
        // Air Weighing & Discharging
        if (prev.airTimbang) {
          setAirWeight(w => w + (AIR_RATE * (UPDATE_INTERVAL / 1000)));
        }
        if (prev.airBuang) {
          setAirWeight(w => Math.max(0, w - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
        }
  
        // Semen Weighing & Discharging
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
  }, [powerOn, operasiMode]);


  // This effect handles AUTO mode
  useEffect(() => {
    if (!powerOn || operasiMode !== 'AUTO' || autoProcessState !== 'running') {
      return;
    }

    const allComplete =
      aggregateWeight >= targetWeights.aggregate &&
      airWeight >= targetWeights.air &&
      semenWeight >= targetWeights.semen;

    if (allComplete) {
      setAutoProcessState('idle');
      console.log('Auto batch completed!');
      return;
    }

    const interval = setInterval(() => {
      setAggregateWeight(prev => prev < targetWeights.aggregate ? Math.min(targetWeights.aggregate, prev + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000))) : prev);
      setAirWeight(prev => prev < targetWeights.air ? Math.min(targetWeights.air, prev + (AIR_RATE * (UPDATE_INTERVAL / 1000))) : prev);
      setSemenWeight(prev => prev < targetWeights.semen ? Math.min(targetWeights.semen, prev + (SEMEN_RATE * (UPDATE_INTERVAL / 1000))) : prev);
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);

  }, [powerOn, operasiMode, autoProcessState, targetWeights, aggregateWeight, airWeight, semenWeight]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Top Section */}
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

        {/* Middle Section */}
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
          <StatusPanel />
        </div>
      </div>

      {/* Bottom Section */}
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
    </div>
  );
}
