import type { Material } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface MaterialInventoryProps {
  materials: Material[];
}

export function MaterialInventory({ materials }: MaterialInventoryProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Material Inventory</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {materials.map(material => {
          const percentage = (material.quantity / material.capacity) * 100;
          const isLow = material.quantity < material.lowLevelThreshold;
          return (
            <div key={material.id} className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <material.Icon className="h-5 w-5 text-muted-foreground" data-ai-hint={material.id === 'sand' ? 'sand' : undefined}/>
                  <span>{material.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLow && <Badge variant="destructive">Low</Badge>}
                  <span className="text-muted-foreground">
                    {material.quantity.toLocaleString()} / {material.capacity.toLocaleString()} {material.unit}
                  </span>
                </div>
              </div>
              <Progress value={percentage} aria-label={`${material.name} inventory level`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
