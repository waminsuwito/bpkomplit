import type { Batch } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BatchHistoryProps {
  history: Batch[];
}

export function BatchHistory({ history }: BatchHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch History</CardTitle>
        <CardDescription>A log of all completed batches.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Formula</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length > 0 ? history.map(batch => (
              <TableRow key={batch.id}>
                <TableCell>{new Date(batch.timestamp).toLocaleString()}</TableCell>
                <TableCell>{batch.formula.name}</TableCell>
                <TableCell>
                  <Badge variant={batch.status === 'Completed' ? 'secondary' : 'destructive'}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell>{batch.deviations || 'N/A'}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No batch history yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
