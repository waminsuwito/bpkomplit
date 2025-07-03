import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeightDisplayProps {
  title: string;
  value: string;
  unit: string;
  target: string;
  complete: string;
}

function WeightDisplay({ title, value, unit, target, complete }: WeightDisplayProps) {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="digital-display">
          <div className="digital-display-value">{value}</div>
          <div className="digital-display-unit">{unit}</div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
          <span>Target: {target}</span>
          <span>Complete: {complete}</span>
        </div>
      </CardContent>
    </Card>
  );
}


export function WeightDisplayPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <WeightDisplay 
        title="Aggregate (Pasir + Batu)"
        value="0.0"
        unit="Kg"
        target="1858.0 Kg"
        complete="0.0% Complete"
      />
      <WeightDisplay 
        title="Air"
        value="0.0"
        unit="Kg"
        target="185.0 Kg"
        complete="0.0% Complete"
      />
       <WeightDisplay 
        title="Semen"
        value="0.0"
        unit="Kg"
        target="325.0 Kg"
        complete="0.0% Complete"
      />
    </div>
  );
}
