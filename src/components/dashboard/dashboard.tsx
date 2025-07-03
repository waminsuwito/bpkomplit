'use client';

import { useState, useEffect } from 'react';
import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './batch-control';
import { StatusPanel } from './ai-advisor';
import { ManualControlPanel, type ManualControlsState } from './batch-history';

// Define rates for weight change, units per second
const AGGREGATE_RATE = 50; // kg/s
const AIR_RATE = 20;       // kg/s
const SEMEN_RATE = 30;     // kg/s
const CONVEYOR_DISCHARGE_RATE = 60; // kg/s
const UPDATE_INTERVAL = 100; // ms

export function Dashboard() {
  const [aggregateWeight, setAggregateWeight] = useState(0);
  const [airWeight, setAirWeight] = useState(0);
  const [semenWeight, setSemenWeight] = useState(0);

  const [activeControls, setActiveControls] = useState<ManualControlsState>({
    pasir1: false, pasir2: false, batu1: false, batu2: false,
    airTimbang: false, airBuang: false, silo1: false, semen: false,
    pintuBuka: false, pintuTutup: false, konveyor: false, klakson: false
  });

  const handleToggle = (key: keyof ManualControlsState) => {
    setActiveControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePress = (key: keyof ManualControlsState, isPressed: boolean) => {
    // Only update if state is different to avoid re-renders
    if (activeControls[key] !== isPressed) {
      setActiveControls(prev => ({ ...prev, [key]: isPressed }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Aggregate Weighing
      if (activeControls.pasir1 || activeControls.pasir2 || activeControls.batu1 || activeControls.batu2) {
        setAggregateWeight(prev => prev + (AGGREGATE_RATE * (UPDATE_INTERVAL / 1000)));
      }
      // Conveyor Discharging
      if (activeControls.konveyor) {
        setAggregateWeight(prev => Math.max(0, prev - (CONVEYOR_DISCHARGE_RATE * (UPDATE_INTERVAL / 1000))));
      }

      // Air Weighing & Discharging
      if (activeControls.airTimbang) {
        setAirWeight(prev => prev + (AIR_RATE * (UPDATE_INTERVAL / 1000)));
      }
      if (activeControls.airBuang) {
        setAirWeight(prev => Math.max(0, prev - (AIR_RATE * (UPDATE_INTERVAL / 1000))));
      }

      // Semen Weighing & Discharging
      if (activeControls.silo1) {
        setSemenWeight(prev => prev + (SEMEN_RATE * (UPDATE_INTERVAL / 1000)));
      }
      if (activeControls.semen) {
        setSemenWeight(prev => Math.max(0, prev - (SEMEN_RATE * (UPDATE_INTERVAL / 1000))));
      }

    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [activeControls]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Top Section */}
        <div className="col-span-12">
          <WeightDisplayPanel
            aggregateWeight={aggregateWeight}
            airWeight={airWeight}
            semenWeight={semenWeight}
          />
        </div>

        {/* Middle Section */}
        <div className="col-span-9">
          <ControlPanel />
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
        />
      </div>
    </div>
  );
}
