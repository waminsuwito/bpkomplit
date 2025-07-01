import type { Formula } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BatchControlProps {
  formulas: Formula[];
  selectedFormula: Formula | undefined;
  setSelectedFormulaId: (id: string) => void;
  canProduce: boolean;
  startBatch: () => void;
  currentBatch: { formula: Formula; status: 'mixing' | 'done'; progress: number } | null;
}

export function BatchControl({ formulas, selectedFormula, setSelectedFormulaId, canProduce, startBatch, currentBatch }: BatchControlProps) {
  
  if (currentBatch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch in Progress</CardTitle>
          <CardDescription>Formula: {currentBatch.formula.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-[280px]">
          {currentBatch.status === 'mixing' ? (
            <>
              <Loader className="h-16 w-16 animate-spin text-primary" />
              <p className="text-lg font-medium">Mixing in Progress...</p>
              <Progress value={currentBatch.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{Math.round(currentBatch.formula.mixingTime * (currentBatch.progress / 100))}s / {currentBatch.formula.mixingTime}s</p>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium">Batch Completed!</p>
            </>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Batch Control</CardTitle>
        <CardDescription>Select a formula to start a new batch.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <label htmlFor="formula-select" className="mb-2 block text-sm font-medium">Formula Preset</label>
          <Select onValueChange={setSelectedFormulaId} defaultValue={selectedFormula?.id}>
            <SelectTrigger id="formula-select">
              <SelectValue placeholder="Select a formula" />
            </SelectTrigger>
            <SelectContent>
              {formulas.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedFormula && (
          <Card className="bg-secondary/50">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{selectedFormula.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {selectedFormula.materials.map(mat => (
                  <li key={mat.materialId} className="flex justify-between">
                    <span>{mat.materialId.charAt(0).toUpperCase() + mat.materialId.slice(1)}</span>
                    <strong>{mat.quantity} {mat.materialId === 'water' || mat.materialId === 'additive' ? 'L' : 'kg'}</strong>
                  </li>
                ))}
                <li className="flex justify-between border-t pt-1 mt-1 border-border">
                  <span>Mixing Time</span>
                  <strong>{selectedFormula.mixingTime}s</strong>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
        {!canProduce && selectedFormula && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Insufficient Materials</AlertTitle>
            <AlertDescription>
              Not enough materials in inventory to produce this batch.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={startBatch} disabled={!canProduce || !selectedFormula} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Start Batch
        </Button>
      </CardFooter>
    </Card>
  );
}
