'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { JobMixForm, type JobMixValues, type JobMixFormula } from '@/components/admin/job-mix-form';
import { JobMixList } from '@/components/admin/job-mix-list';
import { Separator } from '@/components/ui/separator';

const initialFormulas: JobMixFormula[] = [
  { id: '1', mutuBeton: 'K225', pasir: 765, batu: 1029, air: 215, semen: 371 },
  { id: '2', mutuBeton: 'K300', pasir: 698, batu: 1047, air: 215, semen: 413 },
  { id: '3', mutuBeton: 'K350', pasir: 681, batu: 1021, air: 215, semen: 439 },
];

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<JobMixFormula[]>(initialFormulas);
  const [formulaToEdit, setFormulaToEdit] = useState<JobMixFormula | null>(null);

  const handleSaveFormula = (data: JobMixValues) => {
    if (formulaToEdit) {
      // Update existing formula
      setFormulas(formulas.map(f => f.id === formulaToEdit.id ? { ...formulaToEdit, ...data } : f));
    } else {
      // Add new formula
      const newFormula: JobMixFormula = { ...data, id: new Date().toISOString() };
      setFormulas([...formulas, newFormula]);
    }
    setFormulaToEdit(null); // Reset edit state
  };
  
  const handleEdit = (id: string) => {
    const formula = formulas.find(f => f.id === id);
    if (formula) {
      setFormulaToEdit(formula);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: string) => {
    setFormulas(formulas.filter(f => f.id !== id));
  };

  const handleCancelEdit = () => {
    setFormulaToEdit(null);
  };

  return (
    <div className="w-full max-w-4xl space-y-6 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{formulaToEdit ? 'Edit Job Mix Formula' : 'Create Job Mix Formula'}</CardTitle>
          <CardDescription>{formulaToEdit ? `Editing formula for ${formulaToEdit.mutuBeton}.` : 'Create a new concrete formula. All weight values should be in Kilograms (Kg).'} </CardDescription>
        </CardHeader>
        <CardContent>
          <JobMixForm
            onSave={handleSaveFormula}
            formulaToEdit={formulaToEdit}
            onCancel={handleCancelEdit}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
          <CardHeader>
              <CardTitle>Saved Job Mix Formulas</CardTitle>
              <CardDescription>View, edit, or delete existing formulas.</CardDescription>
          </CardHeader>
          <CardContent>
              <JobMixList formulas={formulas} onEdit={handleEdit} onDelete={handleDelete} />
          </CardContent>
      </Card>
    </div>
  );
}
