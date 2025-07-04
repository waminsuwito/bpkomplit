'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface MixingProcessStep {
  id: 'aggregates' | 'water' | 'semen';
  name: string;
  order: number; // The mixing group order. Groups run sequentially.
  delay: number; // Delay in seconds after the group starts.
}

export interface MixingProcessConfig {
  steps: MixingProcessStep[];
}

interface MixingProcessFormProps {
    process: MixingProcessConfig;
    onSave: (process: MixingProcessConfig) => void;
}

export function MixingProcessForm({ process: initialProcess, onSave }: MixingProcessFormProps) {
    const [process, setProcess] = useState(initialProcess);
    const { toast } = useToast();

    useEffect(() => {
        setProcess(initialProcess);
    }, [initialProcess]);

    const handleValueChange = (id: MixingProcessStep['id'], type: 'order' | 'delay', value: string) => {
        const newValue = Number(value);
        if (isNaN(newValue) || newValue < 0) return;

        setProcess(prev => ({
            ...prev,
            steps: prev.steps.map(step => 
                step.id === id ? { ...step, [type]: newValue } : step
            )
        }));
    };

    const handleSubmit = () => {
        onSave(process);
        toast({
            title: 'Proses Mixing Disimpan',
            description: 'Urutan dan jeda waktu telah diperbarui.',
        });
    };

    const getStepDescription = (id: MixingProcessStep['id']) => {
        switch (id) {
            case 'aggregates':
            case 'water':
            case 'semen':
                return 'Jeda Tuang: Waktu tunda penuangan setelah grup urutannya dimulai.';
            default:
                return '';
        }
    }

    return (
        <div className="space-y-6">
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Tahap Proses</TableHead>
                            <TableHead className="text-center">Urutan Mixing</TableHead>
                            <TableHead className="text-center">Jeda Tuang (detik)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {process.steps.map((step, index) => (
                            <TableRow key={step.id}>
                                <TableCell>
                                    <div className="font-medium">{index + 1}. {step.name}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {getStepDescription(step.id)}
                                    </p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input
                                        type="number"
                                        value={step.order}
                                        onChange={(e) => handleValueChange(step.id, 'order', e.target.value)}
                                        className="w-24 mx-auto"
                                        min="1"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input
                                        type="number"
                                        value={step.delay}
                                        onChange={(e) => handleValueChange(step.id, 'delay', e.target.value)}
                                        className="w-24 mx-auto"
                                        min="0"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-end">
                <Button onClick={handleSubmit}>Simpan Perubahan</Button>
            </div>
        </div>
    );
}
