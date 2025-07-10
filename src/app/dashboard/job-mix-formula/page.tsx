
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getFormulas, saveFormulas, type JobMixFormula } from '@/lib/formula';

const MATERIAL_LABELS_KEY = 'app-material-labels';

const defaultMaterialLabels = {
  pasir1: 'Pasir 1',
  pasir2: 'Pasir 2',
  batu1: 'Batu 1',
  batu2: 'Batu 2',
  semen: 'Semen',
  air: 'Air',
};

type MaterialKey = keyof typeof defaultMaterialLabels;

const EditableLabel = React.memo(({ labelKey, value, onChange }: { labelKey: MaterialKey, value: string, onChange: (key: MaterialKey, value: string) => void }) => {
    return (
        <div className="flex flex-col space-y-2">
            <Input 
              value={value}
              onChange={(e) => onChange(labelKey, e.target.value)}
              className="font-medium text-sm p-1 h-auto border-dashed"
            />
             <span className="text-xs text-muted-foreground">(Kg)</span>
        </div>
    )
});
EditableLabel.displayName = 'EditableLabel';

const formulaSchema = z.object({
  mutuBeton: z.string().min(1, 'Mutu Beton is required.'),
  pasir1: z.coerce.number().min(0, 'Value must be positive.'),
  pasir2: z.coerce.number().min(0, 'Value must be positive.'),
  batu1: z.coerce.number().min(0, 'Value must be positive.'),
  batu2: z.coerce.number().min(0, 'Value must be positive.'),
  semen: z.coerce.number().min(0, 'Value must be positive.'),
  air: z.coerce.number().min(0, 'Value must be positive.'),
});

type FormulaFormValues = z.infer<typeof formulaSchema>;

function FormulaManagerPage() {
  const [formulas, setFormulas] = useState<JobMixFormula[]>([]);
  const [editingFormula, setEditingFormula] = useState<JobMixFormula | null>(null);
  const [materialLabels, setMaterialLabels] = useState(defaultMaterialLabels);
  const { toast } = useToast();

  const form = useForm<FormulaFormValues>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      mutuBeton: '',
      pasir1: 0,
      pasir2: 0,
      batu1: 0,
      batu2: 0,
      semen: 0,
      air: 0,
    },
  });

  useEffect(() => {
    setFormulas(getFormulas());
    try {
        const storedLabels = localStorage.getItem(MATERIAL_LABELS_KEY);
        if (storedLabels) {
            setMaterialLabels(JSON.parse(storedLabels));
        }
    } catch (e) { console.error("Failed to load material labels", e); }
  }, []);

  const handleLabelChange = (key: MaterialKey, value: string) => {
    setMaterialLabels(prev => ({...prev, [key]: value }));
  };
  
  const saveMaterialLabels = () => {
    try {
        localStorage.setItem(MATERIAL_LABELS_KEY, JSON.stringify(materialLabels));
        toast({ title: "Label Disimpan", description: "Nama material telah diperbarui."})
    } catch(e) {
        toast({ variant: 'destructive', title: "Gagal Menyimpan", description: "Tidak dapat menyimpan label material."})
    }
  }

  useEffect(() => {
    if (editingFormula) {
      form.reset(editingFormula);
    } else {
      form.reset({ mutuBeton: '', pasir1: 0, pasir2: 0, batu1: 0, batu2: 0, semen: 0, air: 0 });
    }
  }, [editingFormula, form]);

  const onSubmit = (data: FormulaFormValues) => {
    let updatedFormulas;
    if (editingFormula) {
      updatedFormulas = formulas.map(f => f.id === editingFormula.id ? { ...editingFormula, ...data } : f);
      toast({ title: 'Formula Updated', description: `Formula "${data.mutuBeton}" has been updated.` });
    } else {
      const newFormula = { ...data, id: new Date().toISOString() };
      updatedFormulas = [...formulas, newFormula];
      toast({ title: 'Formula Added', description: `Formula "${data.mutuBeton}" has been added.` });
    }
    setFormulas(updatedFormulas);
    saveFormulas(updatedFormulas);
    setEditingFormula(null);
    form.reset();
  };

  const handleEdit = (formula: JobMixFormula) => {
    setEditingFormula(formula);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingFormula(null);
    form.reset();
  };

  const handleDelete = (id: string) => {
    const updatedFormulas = formulas.filter(f => f.id !== id);
    setFormulas(updatedFormulas);
    saveFormulas(updatedFormulas);
    toast({ variant: 'destructive', title: 'Formula Deleted', description: 'The formula has been deleted.' });
  };

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const handlePasswordCheck = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === 'admin') {
          setIsAuthorized(true);
      } else {
          toast({ variant: 'destructive', title: 'Password Salah', description: 'Anda tidak memiliki izin untuk mengakses halaman ini.' });
          setPasswordInput('');
      }
  };

  if (!isAuthorized) {
    return (
        <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent hideCloseButton>
                <DialogHeader>
                    <DialogTitle>Akses Terbatas</DialogTitle>
                    <DialogDescription>
                        Halaman ini memerlukan otorisasi. Silakan masukkan password untuk melanjutkan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordCheck} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password Akses</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={passwordInput} 
                            onChange={(e) => setPasswordInput(e.target.value)} 
                            autoFocus
                        />
                    </div>
                    <Button type="submit" className="w-full">Masuk</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle>Job Mix Formula</CardTitle>
              <CardDescription>
                {editingFormula ? `Editing formula: ${editingFormula.mutuBeton}` : 'Add a new job mix formula or edit an existing one.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </Button>
                <Button onClick={saveMaterialLabels}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Nama Material
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-end">
                <FormField name="mutuBeton" control={form.control} render={({ field }) => (
                <FormItem className="col-span-2">
                    <FormLabel>Mutu Beton</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., K225" style={{ textTransform: 'uppercase' }} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField name="pasir1" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="pasir1" value={materialLabels.pasir1} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField name="pasir2" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="pasir2" value={materialLabels.pasir2} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField name="batu1" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="batu1" value={materialLabels.batu1} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField name="batu2" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="batu2" value={materialLabels.batu2} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField name="semen" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="semen" value={materialLabels.semen} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                 <FormField name="air" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel><EditableLabel labelKey="air" value={materialLabels.air} onChange={handleLabelChange} /></FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>

            <div className="flex justify-end gap-2">
              {editingFormula && <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>}
              <Button type="submit">
                {editingFormula ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                {editingFormula ? 'Update Formula' : 'Add Formula'}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mutu Beton</TableHead>
                <TableHead>{materialLabels.pasir1} (Kg)</TableHead>
                <TableHead>{materialLabels.pasir2} (Kg)</TableHead>
                <TableHead>{materialLabels.batu1} (Kg)</TableHead>
                <TableHead>{materialLabels.batu2} (Kg)</TableHead>
                <TableHead>{materialLabels.semen} (Kg)</TableHead>
                <TableHead>{materialLabels.air} (Kg)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formulas.map((formula) => (
                <TableRow key={formula.id}>
                  <TableCell className="font-medium">{formula.mutuBeton}</TableCell>
                  <TableCell>{formula.pasir1}</TableCell>
                  <TableCell>{formula.pasir2}</TableCell>
                  <TableCell>{formula.batu1}</TableCell>
                  <TableCell>{formula.batu2}</TableCell>
                  <TableCell>{formula.semen}</TableCell>
                  <TableCell>{formula.air}</TableCell>
                  <TableCell className="text-center space-x-2">
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
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(formula.id)}>Delete</AlertDialogAction>
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
  );
}

export default FormulaManagerPage;
