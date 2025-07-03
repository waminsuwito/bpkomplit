import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeightDisplayProps {
  title: string;
  value: number;
  unit: string;
  target: number;
}

function WeightDisplay({ title, value, unit, target }: WeightDisplayProps) {
  const percentage = target > 0 ? ((value / target) * 100).toFixed(1) : "0.0";
  const formattedValue = value.toFixed(1);

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="digital-display">
          <div className="digital-display-value">{formattedValue}</div>
          <div className="digital-display-unit">{unit}</div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
          <span>Target: {target.toFixed(1)} {unit}</span>
          <span>Complete: {percentage}% Complete</span>
        </div>
      </CardContent>
    </Card>
  );
}


export function WeightDisplayPanel({ aggregateWeight, airWeight, semenWeight }: { aggregateWeight: number, airWeight: number, semenWeight: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <WeightDisplay 
        title="Aggregate (Pasir + Batu)"
        value={aggregateWeight}
        unit="Kg"
        target={1858.0}
      />
      <WeightDisplay 
        title="Air"
        value={airWeight}
        unit="Kg"
        target={185.0}
      />
       <WeightDisplay 
        title="Semen"
        value={semenWeight}
        unit="Kg"
        target={325.0}
      />
    </div>
  );
}
