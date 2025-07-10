
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { RELAY_MAPPINGS_KEY, type ControlMapping } from '@/app/dashboard/relay-settings/page';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from '@/lib/firebase';

function ControlGroup({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-card rounded-lg p-3 flex flex-col gap-2 ${className}`}>
            <h3 className="text-center text-primary font-semibold text-sm uppercase tracking-wider mb-1">{title}</h3>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

type ManualControlKey = 'pasir1' | 'pasir2' | 'batu1' | 'batu2' | 'airTimbang' | 'airBuang' | 'semenTimbang' | 'semen' | 'pintuBuka' | 'pintuTutup' | 'konveyorBawah' | 'konveyorAtas' | 'klakson';

type ManualControlsState = {
  [key in ManualControlKey]: boolean;
} & {
  selectedSilo: string;
};

const sendRelayCommand = (relayId: ManualControlKey, state: boolean) => {
    const db = getDatabase(app);
    const commandRef = ref(db, 'realtime/manualCommand');
    set(commandRef, { relayId, state, timestamp: Date.now() });
};

const sendSiloCommand = (siloId: string) => {
    const db = getDatabase(app);
    const commandRef = ref(db, 'realtime/manualCommand');
    set(commandRef, { relayId: 'selectSilo', state: siloId, timestamp: Date.now() });
}

const MomentaryButton = ({ 
  controlKey, 
  children, 
  className, 
  ...props
}: { 
  controlKey: ManualControlKey, 
  children: React.ReactNode, 
  className?: string,
  [x: string]: any; 
}) => {
  const [isActive, setIsActive] = useState(false);
  const handlePress = (isPressed: boolean) => {
    setIsActive(isPressed);
    sendRelayCommand(controlKey, isPressed);
  };
  return (
    <Button
        onMouseDown={() => handlePress(true)}
        onMouseUp={() => handlePress(false)}
        onMouseLeave={() => handlePress(false)}
        onTouchStart={(e) => { e.preventDefault(); handlePress(true); }}
        onTouchEnd={() => handlePress(false)}
        variant={isActive ? 'default' : 'secondary'}
        className={className}
        {...props}
    >
        {children}
    </Button>
  );
};

const ToggleButton = ({ 
  controlKey, 
  children, 
  className,
  ...props
}: { 
  controlKey: ManualControlKey, 
  children: React.ReactNode, 
  className?: string,
  [x: string]: any;
}) => {
  const [isActive, setIsActive] = useState(false);
  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    sendRelayCommand(controlKey, newState);
  };
  return (
    <Button 
        onClick={handleToggle}
        variant={isActive ? 'default' : 'secondary'}
        className={className}
        {...props}
    >
        {children}
    </Button>
  );
};


export default function TombolManualPage() {
    const [labels, setLabels] = useState<Record<string, string>>({});
    const [selectedSilo, setSelectedSilo] = useState('silo1');

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

    const handleSiloChange = (silo: string) => {
        setSelectedSilo(silo);
        sendSiloCommand(silo);
    };

    const getLabel = (key: ManualControlKey, defaultLabel: string) => {
        return labels[key] || defaultLabel;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Tombol Manual</CardTitle>
                        <CardDescription>
                           Gunakan tombol ini untuk mengoperasikan setiap bagian secara manual.
                        </CardDescription>
                    </div>
                     <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <ControlGroup title="Aggregate Halus">
                        <MomentaryButton controlKey="pasir1">{getLabel('pasir1', 'Pasir Galunggung')}</MomentaryButton>
                        <MomentaryButton controlKey="pasir2">{getLabel('pasir2', 'Pasir Kampar')}</MomentaryButton>
                    </ControlGroup>

                    <ControlGroup title="Aggregate Kasar">
                        <MomentaryButton controlKey="batu1">{getLabel('batu1', 'Batu Merak')}</MomentaryButton>
                        <MomentaryButton controlKey="batu2">{getLabel('batu2', 'Batu Cikande')}</MomentaryButton>
                    </ControlGroup>
                    
                    <ControlGroup title="Air">
                        <ToggleButton controlKey="airTimbang">{getLabel('airTimbang', 'AIR TIMBANG')}</ToggleButton>
                        <ToggleButton controlKey="airBuang" className={cn("font-bold")}>{getLabel('airBuang', 'AIR BUANG')}</ToggleButton>
                    </ControlGroup>

                    <ControlGroup title="Semen">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground px-1">PILIH SILO</Label>
                            <Select onValueChange={handleSiloChange} defaultValue={selectedSilo}>
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
                        <ToggleButton controlKey="semenTimbang">
                            {getLabel('semenTimbang', 'TIMBANG SEMEN')}
                        </ToggleButton>
                        <ToggleButton controlKey="semen" className={cn("font-bold")}>
                            {getLabel('semen', 'BUANG SEMEN')}
                        </ToggleButton>
                    </ControlGroup>

                    <div className="grid grid-rows-3 gap-4">
                        <ControlGroup title="Mixer" className="row-span-1">
                            <div className="grid grid-cols-2 gap-2">
                                <MomentaryButton 
                                controlKey="pintuBuka"
                                className={cn("text-white font-bold text-xs bg-green-600 hover:bg-green-700")}
                                >
                                {getLabel('pintuBuka', 'PINTU BUKA')}
                                </MomentaryButton>
                                <MomentaryButton 
                                controlKey="pintuTutup"
                                className={cn("text-white font-bold text-xs bg-red-600 hover:bg-red-700')}
                                >
                                {getLabel('pintuTutup', 'PINTU TUTUP')}
                                </MomentaryButton>
                            </div>
                        </ControlGroup>
                        <ControlGroup title="Konveyor" className="row-span-1">
                            <ToggleButton controlKey="konveyorBawah" className={cn("font-bold text-xs")}>{getLabel('konveyorBawah', 'KONVEYOR BAWAH')}</ToggleButton>
                            <ToggleButton controlKey="konveyorAtas" className={cn("font-bold text-xs")}>{getLabel('konveyorAtas', 'KONVEYOR ATAS')}</ToggleButton>
                        </ControlGroup>
                        <ControlGroup title="System" className="row-span-1">
                            <MomentaryButton controlKey="klakson" className={cn("font-bold text-xs")}>{getLabel('klakson', 'KLAKSON')}</MomentaryButton>
                        </ControlGroup>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
