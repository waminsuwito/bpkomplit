import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function StatusPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">
          Status Relay Real-Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground text-sm h-32">
          <p>Semua relay dalam kondisi OFF</p>
          <p>Belum ada aktivitas relay</p>
        </div>
        <Separator className="my-4 bg-primary/20" />
        <div className="text-center text-muted-foreground text-sm">
          <p>Arduino Mega2560 - USB Connected</p>
        </div>
      </CardContent>
    </Card>
  );
}
