'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  mutuBeton: z.string().min(1, {
    message: 'Mutu Beton name is required.',
  }),
  pasir: z.coerce.number().positive({ message: 'Weight must be a positive number.' }),
  batu: z.coerce.number().positive({ message: 'Weight must be a positive number.' }),
  air: z.coerce.number().positive({ message: 'Weight must be a positive number.' }),
  semen: z.coerce.number().positive({ message: 'Weight must be a positive number.' }),
});

export type JobMixValues = z.infer<typeof formSchema>;
export interface JobMixFormula extends JobMixValues {
  id: string;
}

interface JobMixFormProps {
  onSave: (data: JobMixValues) => void;
  onCancel: () => void;
  formulaToEdit: JobMixFormula | null;
}

export function JobMixForm({ onSave, onCancel, formulaToEdit }: JobMixFormProps) {
  const { toast } = useToast();
  const form = useForm<JobMixValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mutuBeton: '',
      pasir: 0,
      batu: 0,
      air: 0,
      semen: 0,
    },
  });

  useEffect(() => {
    if (formulaToEdit) {
      form.reset(formulaToEdit);
    } else {
      form.reset({
        mutuBeton: '',
        pasir: 0,
        batu: 0,
        air: 0,
        semen: 0,
      });
    }
  }, [formulaToEdit, form]);

  const isEditing = !!formulaToEdit;

  function onSubmit(values: JobMixValues) {
    onSave(values);
    toast({
      title: isEditing ? 'Formula Updated' : 'Formula Saved',
      description: `Job mix for ${values.mutuBeton} has been ${isEditing ? 'updated' : 'saved'} successfully.`,
    });
    if (!isEditing) {
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mutuBeton"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mutu Beton</FormLabel>
              <FormControl>
                <Input placeholder="e.g., K225" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="pasir"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Pasir (Kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="batu"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Batu (Kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="air"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Air (Kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="semen"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Semen (Kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0.0" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end gap-2">
          {isEditing && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{isEditing ? 'Update Formula' : 'Save Formula'}</Button>
        </div>
      </form>
    </Form>
  );
}
