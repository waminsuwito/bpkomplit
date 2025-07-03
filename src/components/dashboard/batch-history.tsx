'use client';

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";

function ControlGroup({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={`control-card ${className}`}>
            <h3 className="control-card-title">{title}</h3>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

type ManualControlsState = {
  pasir1: boolean;
  pasir2: boolean;
  batu1: boolean;
  batu2: boolean;
  airTimbang: boolean;
  airBuang: boolean;
  silo1: boolean;
  semen: boolean;
  pintuBuka: boolean;
  pintuTutup: boolean;
  konveyor: boolean;
  klakson: boolean;
}

export function ManualControlPanel() {
  const [activeControls, setActiveControls] = useState<ManualControlsState>({
    pasir1: false, pasir2: false, batu1: false, batu2: false, airTimbang: false, airBuang: false, silo1: false, semen: false, pintuBuka: false, pintuTutup: false, konveyor: false, klakson: false
  });

  const handleToggle = (key: keyof ManualControlsState) => {
    setActiveControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePress = (key: keyof ManualControlsState, isPressed: boolean) => {
    // Only update if state is different to avoid re-renders on mouse-leave etc.
    if (activeControls[key] !== isPressed) {
      setActiveControls(prev => ({ ...prev, [key]: isPressed }));
    }
  };

  // For standard silver buttons
  const MomentaryButton = ({ controlKey, children }: { controlKey: keyof ManualControlsState, children: React.ReactNode }) => (
    <Button
      onMouseDown={() => handlePress(controlKey, true)}
      onMouseUp={() => handlePress(controlKey, false)}
      onMouseLeave={() => handlePress(controlKey, false)}
      onTouchStart={() => handlePress(controlKey, true)}
      onTouchEnd={() => handlePress(controlKey, false)}
      variant={activeControls[controlKey] ? 'default' : 'secondary'}
    >
      {children}
    </Button>
  );
  
  // For standard silver buttons
  const ToggleButton = ({ controlKey, children }: { controlKey: keyof ManualControlsState, children: React.ReactNode }) => (
    <Button 
      onClick={() => handleToggle(controlKey)}
      variant={activeControls[controlKey] ? 'default' : 'secondary'}
    >
      {children}
    </Button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ControlGroup title="Aggregate Halus">
            <MomentaryButton controlKey="pasir1">PASIR 1</MomentaryButton>
            <MomentaryButton controlKey="pasir2">PASIR 2</MomentaryButton>
        </ControlGroup>

        <ControlGroup title="Aggregate Kasar">
            <MomentaryButton controlKey="batu1">BATU 1</MomentaryButton>
            <MomentaryButton controlKey="batu2">BATU 2</MomentaryButton>
        </ControlGroup>
        
        <ControlGroup title="Air">
            <ToggleButton controlKey="airTimbang">AIR TIMBANG</ToggleButton>
            <Button onClick={() => handleToggle('airBuang')} className={cn("font-bold", activeControls.airBuang ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")}>AIR BUANG</Button>
        </ControlGroup>

        <ControlGroup title="Semen">
            <ToggleButton controlKey="silo1">SILO 1</ToggleButton>
            <Button onClick={() => handleToggle('semen')} className={cn("font-bold", activeControls.semen ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")}>SEMEN</Button>
        </ControlGroup>

        <div className="grid grid-rows-3 gap-4">
            <ControlGroup title="Mixer" className="row-span-1">
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onMouseDown={() => handlePress('pintuBuka', true)} 
                      onMouseUp={() => handlePress('pintuBuka', false)} 
                      onMouseLeave={() => handlePress('pintuBuka', false)}
                      onTouchStart={() => handlePress('pintuBuka', true)}
                      onTouchEnd={() => handlePress('pintuBuka', false)}
                      className={cn("text-white font-bold text-xs", activeControls.pintuBuka ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700')}
                    >
                      PINTU BUKA
                    </Button>
                    <Button 
                      onMouseDown={() => handlePress('pintuTutup', true)} 
                      onMouseUp={() => handlePress('pintuTutup', false)} 
                      onMouseLeave={() => handlePress('pintuTutup', false)}
                      onTouchStart={() => handlePress('pintuTutup', true)}
                      onTouchEnd={() => handlePress('pintuTutup', false)}
                      className={cn("text-white font-bold text-xs", activeControls.pintuTutup ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700')}
                    >
                      PINTU TUTUP
                    </Button>
                </div>
            </ControlGroup>
            <ControlGroup title="Konveyor" className="row-span-1">
                 <Button onClick={() => handleToggle('konveyor')} className={cn("font-bold text-xs", activeControls.konveyor ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")}>KONVEYOR</Button>
            </ControlGroup>
             <ControlGroup title="System" className="row-span-1">
                 <Button 
                    onMouseDown={() => handlePress('klakson', true)} 
                    onMouseUp={() => handlePress('klakson', false)} 
                    onMouseLeave={() => handlePress('klakson', false)}
                    onTouchStart={() => handlePress('klakson', true)}
                    onTouchEnd={() => handlePress('klakson', false)}
                    className={cn("font-bold text-xs", activeControls.klakson ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")}
                  >
                   KLAKSON
                  </Button>
            </ControlGroup>
        </div>
    </div>
  )
}
