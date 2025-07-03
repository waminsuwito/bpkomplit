'use client';

import { type JobMixFormula } from './job-mix-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';

interface JobMixListProps {
  formulas: JobMixFormula[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function JobMixList({ formulas, onEdit, onDelete }: JobMixListProps) {
  
  if (formulas.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No job mix formulas saved yet.</p>
            <p>Create a new formula above to see it here.</p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mutu Beton</TableHead>
            <TableHead className="text-right">Pasir (Kg)</TableHead>
            <TableHead className="text-right">Batu (Kg)</TableHead>
            <TableHead className="text-right">Air (Kg)</TableHead>
            <TableHead className="text-right">Semen (Kg)</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formulas.map((formula) => (
            <TableRow key={formula.id}>
              <TableCell className="font-medium">{formula.mutuBeton}</TableCell>
              <TableCell className="text-right">{formula.pasir}</TableCell>
              <TableCell className="text-right">{formula.batu}</TableCell>
              <TableCell className="text-right">{formula.air}</TableCell>
              <TableCell className="text-right">{formula.semen}</TableCell>
              <TableCell className="flex justify-center items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(formula.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the 
                        <span className="font-semibold"> {formula.mutuBeton} </span> 
                        formula.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(formula.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
