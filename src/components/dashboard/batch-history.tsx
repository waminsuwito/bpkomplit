
'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from "react";
import type { ControlMapping } from "./relay-settings/page";
import { RELAY_MAPPINGS_KEY } from "./relay-settings/page";

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
  selectedSilo: string;
  semenTimbang: boolean;
  semen: boolean;
  pintuBuka: boolean;
  pintuTutup: boolean;
  konveyorBawah: boolean;
  konveyorAtas: boolean;
  klakson: boolean;
}

interface ManualControlPanelProps {
    activeControls: ManualControlsState;
    handleToggle: (key: keyof ManualControlsState) => void;
    handlePress: (key: keyof ManualControlsState, isPressed: boolean) => void;
    handleSiloChange: (silo: string) => void;
    disabled: boolean;
}

const MomentaryButton = ({ 
  controlKey, 
  children, 
  className, 
  handlePress, 
  isActive,
  ...props
}: { 
  controlKey: keyof ManualControlsState, 
  children: React.ReactNode, 
  className?: string,
  handlePress: (key: keyof ManualControlsState, isPressed: boolean) => void,
  isActive: boolean,
  [x: string]: any; 
}) => (
  <Button
    onMouseDown={() => handlePress(controlKey, true)}
    onMouseUp={() => handlePress(controlKey, false)}
    onMouseLeave={() => handlePress(controlKey, false)}
    onTouchStart={() => handlePress(controlKey, true)}
    onTouchEnd={() => handlePress(controlKey, false)}
    variant={isActive ? 'default' : 'secondary'}
    className={className}
    {...props}
  >
    {children}
  </Button>
);

const ToggleButton = ({ 
  controlKey, 
  children, 
  className,
  handleToggle,
  isActive,
  ...props
}: { 
  controlKey: keyof ManualControlsState, 
  children: React.ReactNode, 
  className?: string,
  handleToggle: (key: keyof ManualControlsState) => void,
  isActive: boolean,
  [x: string]: any;
}) => (
  <Button 
    onClick={() => handleToggle(controlKey)}
    variant={isActive ? 'default' : 'secondary'}
    className={className}
    {...props}
  >
    {children}
  </Button>
);

export function ManualControlPanel({ activeControls, handleToggle, handlePress, handleSiloChange, disabled }: ManualControlPanelProps) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const storedMappingsRaw = localStorage.getItem(RELAY_MAPPINGS_KEY);
      if (storedMappingsRaw) {
        const storedMappings: ControlMapping[] = JSON.parse(storedMappingsRaw);
        const newLabels = storedMappings.reduce((acc, curr) => {
          acc[curr.id] = curr.label;
          return acc;
        }, {} as Record<string, string>);
        setLabels(newLabels);
      }
    } catch (error) {
      console.error("Failed to load control labels:", error);
    }
  }, []);

  const getLabel = (key: keyof ManualControlsState, defaultLabel: string) => {
    return labels[key] || defaultLabel;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ControlGroup title="Aggregate Halus">
            <MomentaryButton controlKey="pasir1" handlePress={handlePress} isActive={activeControls.pasir1} disabled={disabled}>{getLabel('pasir1', 'PASIR 1')}</MomentaryButton>
            <MomentaryButton controlKey="pasir2" handlePress={handlePress} isActive={activeControls.pasir2} disabled={disabled}>{getLabel('pasir2', 'PASIR 2')}</MomentaryButton>
        </ControlGroup>

        <ControlGroup title="Aggregate Kasar">
            <MomentaryButton controlKey="batu1" handlePress={handlePress} isActive={activeControls.batu1} disabled={disabled}>{getLabel('batu1', 'BATU 1')}</MomentaryButton>
            <MomentaryButton controlKey="batu2" handlePress={handlePress} isActive={activeControls.batu2} disabled={disabled}>{getLabel('batu2', 'BATU 2')}</MomentaryButton>
        </ControlGroup>
        
        <ControlGroup title="Air">
            <ToggleButton controlKey="airTimbang" handleToggle={handleToggle} isActive={activeControls.airTimbang} disabled={disabled}>{getLabel('airTimbang', 'AIR TIMBANG')}</ToggleButton>
            <ToggleButton controlKey="airBuang" handleToggle={handleToggle} isActive={activeControls.airBuang} className={cn("font-bold", activeControls.airBuang && "bg-accent hover:bg-accent/90 text-accent-foreground")} disabled={disabled}>{getLabel('airBuang', 'AIR BUANG')}</ToggleButton>
        </ControlGroup>

        <ControlGroup title="Semen">
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground px-1">PILIH SILO</Label>
                <Select onValueChange={handleSiloChange} defaultValue={activeControls.selectedSilo} disabled={disabled}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih silo..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="silo1">Silo 1</SelectItem>
                        <SelectItem value="silo2">Silo 2</SelectItem>
                        <SelectItem value="silo3">Silo 3</SelectItem>
                        <SelectItem value="silo4">Silo 4</SelectItem>
                        <SelectItem value="silo5">Silo 5</SelectItem>
                        <SelectItem value="silo6">Silo 6</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ToggleButton controlKey="semenTimbang" handleToggle={handleToggle} isActive={activeControls.semenTimbang} disabled={disabled}>
                {getLabel('semenTimbang', 'TIMBANG SEMEN')}
            </ToggleButton>
            <ToggleButton controlKey="semen" handleToggle={handleToggle} isActive={activeControls.semen} className={cn("font-bold", activeControls.semen && "bg-accent hover:bg-accent/90 text-accent-foreground")} disabled={disabled}>
                {getLabel('semen', 'BUANG SEMEN')}
            </ToggleButton>
        </ControlGroup>

        <div className="grid grid-rows-3 gap-4">
            <ControlGroup title="Mixer" className="row-span-1">
                <div className="grid grid-cols-2 gap-2">
                    <MomentaryButton 
                      controlKey="pintuBuka"
                      handlePress={handlePress}
                      isActive={activeControls.pintuBuka}
                      className={cn("text-white font-bold text-xs", activeControls.pintuBuka ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700')}
                      disabled={disabled}
                    >
                      {getLabel('pintuBuka', 'PINTU BUKA')}
                    </MomentaryButton>
                    <MomentaryButton 
                      controlKey="pintuTutup"
                      handlePress={handlePress}
                      isActive={activeControls.pintuTutup}
                      className={cn("text-white font-bold text-xs", activeControls.pintuTutup ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700')}
                      disabled={disabled}
                    >
                      {getLabel('pintuTutup', 'PINTU TUTUP')}
                    </MomentaryButton>
                </div>
            </ControlGroup>
            <ControlGroup title="Konveyor" className="row-span-1">
                 <ToggleButton controlKey="konveyorBawah" handleToggle={handleToggle} isActive={activeControls.konveyorBawah} className={cn("font-bold text-xs", activeControls.konveyorBawah && "bg-accent hover:bg-accent/90 text-accent-foreground")} disabled={disabled}>{getLabel('konveyorBawah', 'KONVEYOR BAWAH')}</ToggleButton>
                 <ToggleButton controlKey="konveyorAtas" handleToggle={handleToggle} isActive={activeControls.konveyorAtas} className={cn("font-bold text-xs", activeControls.konveyorAtas && "bg-accent hover:bg-accent/90 text-accent-foreground")} disabled={disabled}>{getLabel('konveyorAtas', 'KONVEYOR ATAS')}</ToggleButton>
            </ControlGroup>
             <ControlGroup title="System" className="row-span-1">
                 <MomentaryButton controlKey="klakson" handlePress={handlePress} isActive={activeControls.klakson} className={cn("font-bold text-xs", activeControls.klakson ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground")} disabled={disabled}>{getLabel('klakson', 'KLAKSON')}</MomentaryButton>
            </ControlGroup>
        </div>
    </div>
  )
}
