'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getAiSuggestions } from '@/lib/actions';
import type { Batch } from '@/lib/types';

const aiAdvisorSchema = z.object({
  historicalBatchData: z.string().min(10, 'Please provide some historical data.'),
  currentMaterialQuality: z.string().min(10, 'Please describe the current material quality.'),
  environmentalFactors: z.string().min(10, 'Please describe the environmental factors.'),
  targetMixProperties: z.string().min(10, 'Please describe the target mix properties.'),
});

type AIAdvisorFormValues = z.infer<typeof aiAdvisorSchema>;

interface AIAdvisorProps {
  history: Batch[];
}

export function AIAdvisor({ history }: AIAdvisorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ suggestedAdjustments: string; rationale: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const historicalDataSummary = history
    .map(b => `Batch ${b.id}: Formula ${b.formula.name}, Completed: ${b.timestamp}. ${b.deviations ? `Notes: ${b.deviations}` : ''}`)
    .join('\n');
    
  const form = useForm<AIAdvisorFormValues>({
    resolver: zodResolver(aiAdvisorSchema),
    defaultValues: {
      historicalBatchData: historicalDataSummary,
      currentMaterialQuality: 'Sand moisture content is slightly higher than average. Cement is from a new supplier, seems finer.',
      environmentalFactors: 'Ambient temperature: 25°C, Humidity: 60%. Light rain expected in the afternoon.',
      targetMixProperties: 'Target slump: 150mm. Target 28-day strength: 35 MPa. Good workability for pumping.',
    },
  });

  async function onSubmit(data: AIAdvisorFormValues) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await getAiSuggestions(data);
      setSuggestion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> AI Mix Advisor
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to optimize your concrete mix based on current conditions.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="historicalBatchData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Batch Data</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Data from previous batches..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentMaterialQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Material Quality</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Moisture content, purity..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="environmentalFactors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environmental Factors</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Temperature, humidity..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="targetMixProperties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Mix Properties</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Strength, consistency..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Get Suggestions'}
            </Button>
          </form>
        </Form>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Bot className="h-16 w-16 mb-4 animate-bounce text-primary" />
              <p className="text-lg font-semibold">Our AI is thinking...</p>
              <p className="text-sm text-muted-foreground">This may take a moment.</p>
            </div>
          )}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
              </CardContent>
            </Card>
          )}
          {suggestion && (
            <div className="space-y-4">
               <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="text-primary"/> Suggested Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90">{suggestion.suggestedAdjustments}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">Rationale</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
