'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface MixingProcessStep {
  id: 'aggregates' | 'water' | 'semen';
  name: string;
  delay: number; // Delay in seconds
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

    const handleDelayChange = (id: MixingProcessStep['id'], value: string) => {
        const newDelay = Number(value);
        if (isNaN(newDelay) || newDelay < 0) return;

        setProcess(prev => ({
            ...prev,
            steps: prev.steps.map(step => 
                step.id === id ? { ...step, delay: newDelay } : step
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
                return 'Jeda waktu dari mulai menuang agregat hingga mulai menuang air.';
            case 'water':
                return 'Jeda waktu dari mulai menuang air hingga mulai menuang semen.';
            case 'semen':
                return 'Total waktu pencampuran setelah semua material masuk ke dalam mixer.';
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
                            <TableHead className="w-[70%]">Urutan Mixing</TableHead>
                            <TableHead className="text-right">Jeda (detik)</TableHead>
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
                                <TableCell className="text-right">
                                    <Input
                                        type="number"
                                        value={step.delay}
                                        onChange={(e) => handleDelayChange(step.id, e.target.value)}
                                        className="w-24 ml-auto"
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
