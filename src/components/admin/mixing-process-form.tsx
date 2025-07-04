'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface MixingProcessStep {
  id: 'aggregates' | 'water' | 'semen';
  name: string;
  startDelay: number; // Delay from pressing START to begin WEIGHING (seconds)
  actionDelay: number; // Delay/duration for the DISCHARGE/MIXING action (seconds)
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

    const handleDelayChange = (id: MixingProcessStep['id'], type: 'startDelay' | 'actionDelay', value: string) => {
        const newDelay = Number(value);
        if (isNaN(newDelay) || newDelay < 0) return;

        setProcess(prev => ({
            ...prev,
            steps: prev.steps.map(step => 
                step.id === id ? { ...step, [type]: newDelay } : step
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
                return 'Jeda/Durasi: Waktu dari mulai menuang agregat hingga mulai menuang air.';
            case 'water':
                return 'Jeda/Durasi: Waktu dari mulai menuang air hingga mulai menuang semen.';
            case 'semen':
                return 'Jeda/Durasi: Total waktu pencampuran setelah semua material masuk.';
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
                            <TableHead className="text-center">Tunda Timbang (detik)</TableHead>
                            <TableHead className="text-center">Jeda/Durasi (detik)</TableHead>
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
                                        value={step.startDelay}
                                        onChange={(e) => handleDelayChange(step.id, 'startDelay', e.target.value)}
                                        className="w-24 mx-auto"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input
                                        type="number"
                                        value={step.actionDelay}
                                        onChange={(e) => handleDelayChange(step.id, 'actionDelay', e.target.value)}
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
