'use client';

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

export type ManualControlsState = {
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

interface ManualControlPanelProps {
    activeControls: ManualControlsState;
    handleToggle: (key: keyof ManualControlsState) => void;
    handlePress: (key: keyof ManualControlsState, isPressed: boolean) => void;
}

export function ManualControlPanel({ activeControls, handleToggle, handlePress }: ManualControlPanelProps) {

  const MomentaryButton = ({ controlKey, children, className }: { controlKey: keyof ManualControlsState, children: React.ReactNode, className?: string }) => (
    <Button
      onMouseDown={() => handlePress(controlKey, true)}
      onMouseUp={() => handlePress(controlKey, false)}
      onMouseLeave={() => handlePress(controlKey, false)}
      onTouchStart={() => handlePress(controlKey, true)}
      onTouchEnd={() => handlePress(controlKey, false)}
      variant={activeControls[controlKey] ? 'default' : 'secondary'}
      className={className}
    >
      {children}
    </Button>
  );
  
  const ToggleButton = ({ controlKey, children, className }: { controlKey: keyof ManualControlsState, children: React.ReactNode, className?: string }) => (
    <Button 
      onClick={() => handleToggle(controlKey)}
      variant={activeControls[controlKey] ? 'default' : 'secondary'}
      className={className}
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
            <ToggleButton controlKey="airBuang" className={cn("font-bold", activeControls.airBuang && "bg-accent hover:bg-accent/90 text-accent-foreground")}>AIR BUANG</ToggleButton>
        </ControlGroup>

        <ControlGroup title="Semen">
            <ToggleButton controlKey="silo1">SILO 1</ToggleButton>
            <ToggleButton controlKey="semen" className={cn("font-bold", activeControls.semen && "bg-accent hover:bg-accent/90 text-accent-foreground")}>SEMEN</ToggleButton>
        </ControlGroup>

        <div className="grid grid-rows-3 gap-4">
            <ControlGroup title="Mixer" className="row-span-1">
                <div className="grid grid-cols-2 gap-2">
                    <MomentaryButton 
                      controlKey="pintuBuka"
                      className={cn("text-white font-bold text-xs", activeControls.pintuBuka ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700')}
                    >
                      PINTU BUKA
                    </MomentaryButton>
                    <MomentaryButton 
                      controlKey="pintuTutup"
                      className={cn("text-white font-bold text-xs", activeControls.pintuTutup ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700')}
                    >
                      PINTU TUTUP
                    </MomentaryButton>
                </div>
            </ControlGroup>
            <ControlGroup title="Konveyor" className="row-span-1">
                 <ToggleButton controlKey="konveyor" className={cn("font-bold text-xs", activeControls.konveyor && "bg-accent hover:bg-accent/90 text-accent-foreground")}>KONVEYOR</ToggleButton>
            </ControlGroup>
             <ControlGroup title="System" className="row-span-1">
                 <MomentaryButton controlKey="klakson" className={cn("font-bold text-xs", activeControls.klakson ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")}>KLAKSON</MomentaryButton>
            </ControlGroup>
        </div>
    </div>
  )
}
