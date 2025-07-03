'use client';

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

export function JobMixForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mutuBeton: '',
      pasir: 0,
      batu: 0,
      air: 0,
      semen: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would save this data to a database.
    console.log('New Job Mix Formula:', values);
    toast({
      title: 'Formula Saved',
      description: `Job mix for ${values.mutuBeton} has been saved successfully.`,
    });
    form.reset();
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
        <div className="flex justify-end">
          <Button type="submit">Save Formula</Button>
        </div>
      </form>
    </Form>
  );
}
