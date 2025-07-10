
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react';
import type { JobMixFormula } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFormulas, addFormula, updateFormula, deleteFormula } from '@/lib/formula';
import { AuthGuard } from '@/components/auth/auth-guard';
import Link from 'next/link';

const formulaSchema = z.object({
  mutuBeton: z.string().min(1, 'Mutu Beton is required.'),
  pasir: z.coerce.number().min(0, 'Value must be positive.'),
  batu: z.coerce.number().min(0, 'Value must be positive.'),
  air: z.coerce.number().min(0, 'Value must be positive.'),
  semen: z.coerce.number().min(0, 'Value must be positive.'),
});

type FormulaFormValues = z.infer<typeof formulaSchema>;

function FormulaManagerPage() {
  const [formulas, setFormulas] = useState<JobMixFormula[]>([]);
  const [editingFormula, setEditingFormula] = useState<JobMixFormula | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFormulas(getFormulas());
  }, []);

  const form = useForm<FormulaFormValues>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      mutuBeton: '',
      pasir: 0,
      batu: 0,
      air: 0,
      semen: 0,
    },
  });

  useEffect(() => {
    if (editingFormula) {
      form.reset(editingFormula);
    } else {
      form.reset({ mutuBeton: '', pasir: 0, batu: 0, air: 0, semen: 0 });
    }
  }, [editingFormula, form]);

  const onSubmit = (data: FormulaFormValues) => {
    if (editingFormula) {
      updateFormula({ ...data, id: editingFormula.id });
      toast({ title: 'Formula Updated', description: `Formula "${data.mutuBeton}" has been updated.` });
    } else {
      addFormula(data);
      toast({ title: 'Formula Added', description: `Formula "${data.mutuBeton}" has been added.` });
    }
    setFormulas(getFormulas());
    setEditingFormula(null);
    form.reset();
  };

  const handleDelete = (id: string) => {
    deleteFormula(id);
    setFormulas(getFormulas());
    toast({ variant: 'destructive', title: 'Formula Deleted', description: 'The formula has been removed.' });
  }

  const handleEdit = (formula: JobMixFormula) => {
    setEditingFormula(formula);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingFormula(null);
    form.reset();
  };
  
  return (
    <AuthGuard requiredRoles={['super_admin', 'supervisor']}>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Job Mix Formula Management</h1>
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </Button>
            </div>
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <ShieldCheck />
                {editingFormula ? `Editing formula: ${editingFormula.mutuBeton}` : 'Add New Job Mix Formula'}
                </CardTitle>
                <CardDescription>
                Add or edit job mix formulas. These will be available on the main dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-6">
                    <FormField name="mutuBeton" control={form.control} render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Mutu Beton (e.g., K225)</FormLabel>
                        <FormControl><Input {...field} style={{ textTransform: 'uppercase' }} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField name="pasir" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pasir (Kg)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField name="batu" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Batu (Kg)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField name="air" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Air (Kg)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField name="semen" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Semen (Kg)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <div className="md:col-span-6 flex justify-end gap-2">
                    {editingFormula && <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>}
                    <Button type="submit">
                        {editingFormula ? 'Update Formula' : 'Add Formula'}
                    </Button>
                    </div>
                </form>
                </Form>
                
                <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Mutu Beton</TableHead>
                        <TableHead>Pasir (Kg)</TableHead>
                        <TableHead>Batu (Kg)</TableHead>
                        <TableHead>Air (Kg)</TableHead>
                        <TableHead>Semen (Kg)</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {formulas.map((formula) => (
                        <TableRow key={formula.id}>
                        <TableCell className="font-medium">{formula.mutuBeton}</TableCell>
                        <TableCell>{formula.pasir}</TableCell>
                        <TableCell>{formula.batu}</TableCell>
                        <TableCell>{formula.air}</TableCell>
                        <TableCell>{formula.semen}</TableCell>
                        <TableCell className="flex justify-center items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(formula)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the formula for <span className="font-semibold">{formula.mutuBeton}</span>.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(formula.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </div>
    </AuthGuard>
  );
}

export default FormulaManagerPage;
