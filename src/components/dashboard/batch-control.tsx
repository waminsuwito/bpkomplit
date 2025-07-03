import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function ControlPanel() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Job Info */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="mutu-beton" className="text-xs text-muted-foreground">MUTU BETON</Label>
            <Select>
              <SelectTrigger id="mutu-beton"><SelectValue placeholder="K225" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="k225">K225</SelectItem>
                <SelectItem value="k300">K300</SelectItem>
                <SelectItem value="k350">K350</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nama-pelanggan" className="text-xs text-muted-foreground">NAMA PELANGGAN</Label>
             <Select>
              <SelectTrigger id="nama-pelanggan"><SelectValue placeholder="Masukkan nama pelanggan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-abadi">PT. Abadi</SelectItem>
                <SelectItem value="pt-jaya">PT. Jaya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lokasi-proyek" className="text-xs text-muted-foreground">LOKASI PROYEK</Label>
             <Select>
              <SelectTrigger id="lokasi-proyek"><SelectValue placeholder="Masukkan lokasi proyek" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="proyek-a">Proyek A</SelectItem>
                <SelectItem value="proyek-b">Proyek B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Target Volume */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-4">
           <div>
            <Label htmlFor="target-volume" className="text-xs text-muted-foreground">TARGET VOLUME</Label>
            <Input id="target-volume" type="number" defaultValue="1" />
          </div>
           <div>
            <Label htmlFor="jumlah-mixing" className="text-xs text-muted-foreground">JUMLAH MIXING</Label>
            <Input id="jumlah-mixing" type="number" defaultValue="1" />
             <p className="text-xs text-muted-foreground mt-1">Volume per mixing: 1.0 M³</p>
          </div>
          <div>
            <Label htmlFor="slump" className="text-xs text-muted-foreground">SLUMP</Label>
            <Input id="slump" type="number" defaultValue="12" />
          </div>
        </CardContent>
      </Card>

      {/* Process Controls */}
      <Card className="col-span-1">
        <CardContent className="pt-6 space-y-2">
           <div className="text-center text-primary uppercase text-sm tracking-wider font-semibold mb-2">Mode Operasi</div>
           <div className="grid grid-cols-2 gap-2">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">MANUAL</Button>
              <Button variant="secondary" className="font-bold">AUTO</Button>
           </div>
           <div className="text-center text-primary uppercase text-sm tracking-wider font-semibold pt-4 mb-2">Kontrol Proses</div>
           <div className="grid grid-cols-3 gap-2">
             <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs col-span-1">START</Button>
             <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs col-span-1">PAUSE</Button>
             <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs col-span-1">STOP</Button>
           </div>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">KLAKSON</Button>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">POWER ON</Button>
        </CardContent>
      </Card>
    </div>
  );
}
