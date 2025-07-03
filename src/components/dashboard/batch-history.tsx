import { Button } from "@/components/ui/button"

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

export function ManualControlPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ControlGroup title="Aggregate Halus">
            <Button variant="secondary">PASIR 1</Button>
            <Button variant="secondary">PASIR 2</Button>
            <div className="mt-2 pt-2 border-t-2 border-yellow-500 text-xs text-center text-muted-foreground">
                Power: <span className="text-red-500">OFF</span> | Mode: <span className="text-yellow-400">MANUAL</span> | Status: <span className="text-green-400">STANDBY</span>
            </div>
        </ControlGroup>

        <ControlGroup title="Aggregate Kasar">
            <Button variant="secondary">BATU 1</Button>
            <Button variant="secondary">BATU 2</Button>
        </ControlGroup>
        
        <ControlGroup title="Air">
            <Button variant="secondary">AIR TIMBANG</Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">AIR BUANG</Button>
        </ControlGroup>

        <ControlGroup title="Semen">
            <Button variant="secondary">SILO 1</Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">SEMEN</Button>
        </ControlGroup>

        <div className="grid grid-rows-3 gap-4">
            <ControlGroup title="Mixer" className="row-span-1">
                <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs">PINTU BUKA</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs">PINTU TUTUP</Button>
                </div>
            </ControlGroup>
            <ControlGroup title="Konveyor" className="row-span-1">
                 <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs">KONVEYOR</Button>
            </ControlGroup>
             <ControlGroup title="System" className="row-span-1">
                 <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs">KLAKSON</Button>
            </ControlGroup>
        </div>
    </div>
  )
}
