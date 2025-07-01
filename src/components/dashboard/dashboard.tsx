'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Material, Formula, Batch } from '@/lib/types';
import { Droplets, Container, Box, TestTube2, Waves, LayoutGrid, History, Bot } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaterialInventory } from './material-inventory';
import { BatchControl } from './batch-control';
import { BatchHistory } from './batch-history';
import { AIAdvisor } from './ai-advisor';

// Mock Data
const initialMaterials: Material[] = [
  { id: 'cement', name: 'Cement', quantity: 4500, capacity: 10000, unit: 'kg', Icon: Container, lowLevelThreshold: 1000 },
  { id: 'sand', name: 'Sand', quantity: 8000, capacity: 20000, unit: 'kg', Icon: Waves, lowLevelThreshold: 2000 },
  { id: 'gravel', name: 'Gravel', quantity: 12000, capacity: 20000, unit: 'kg', Icon: Box, lowLevelThreshold: 2500 },
  { id: 'water', name: 'Water', quantity: 3000, capacity: 5000, unit: 'L', Icon: Droplets, lowLevelThreshold: 500 },
  { id: 'additive', name: 'Additive', quantity: 250, capacity: 500, unit: 'L', Icon: TestTube2, lowLevelThreshold: 50 },
];

const initialFormulas: Formula[] = [
  { 
    id: 'c30', 
    name: 'Concrete C30/37', 
    materials: [
      { materialId: 'cement', quantity: 350 },
      { materialId: 'sand', quantity: 700 },
      { materialId: 'gravel', quantity: 1050 },
      { materialId: 'water', quantity: 175 },
      { materialId: 'additive', quantity: 5 },
    ],
    mixingTime: 120 
  },
  { 
    id: 'c25', 
    name: 'Concrete C25/30', 
    materials: [
      { materialId: 'cement', quantity: 300 },
      { materialId: 'sand', quantity: 650 },
      { materialId: 'gravel', quantity: 1150 },
      { materialId: 'water', quantity: 180 },
      { materialId: 'additive', quantity: 4 },
    ],
    mixingTime: 110 
  },
];

const initialBatchHistory: Batch[] = [
    { id: 'batch-1', formula: initialFormulas[0], timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Completed' },
    { id: 'batch-2', formula: initialFormulas[1], timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Completed' },
    { id: 'batch-3', formula: initialFormulas[0], timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'Completed', deviations: 'Water reduced by 2% due to high sand moisture.' },
];

export function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [formulas] = useState<Formula[]>(initialFormulas);
  const [batchHistory, setBatchHistory] = useState<Batch[]>(initialBatchHistory);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(formulas[0].id);
  const [currentBatch, setCurrentBatch] = useState<{ formula: Formula; status: 'mixing' | 'done'; progress: number } | null>(null);

  const selectedFormula = useMemo(() => formulas.find(f => f.id === selectedFormulaId), [formulas, selectedFormulaId]);

  const canProduce = useMemo(() => {
    if (!selectedFormula) return false;
    return selectedFormula.materials.every(fm => {
      const material = materials.find(m => m.id === fm.materialId);
      return material && material.quantity >= fm.quantity;
    });
  }, [selectedFormula, materials]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentBatch?.status === 'mixing') {
      interval = setInterval(() => {
        setCurrentBatch(prev => {
          if (!prev) return null;
          const newProgress = prev.progress + (100 / prev.formula.mixingTime);
          if (newProgress >= 100) {
            clearInterval(interval);
            
            setBatchHistory(prevHistory => [{
              id: `batch-${Date.now()}`,
              formula: prev.formula,
              timestamp: new Date().toISOString(),
              status: 'Completed'
            }, ...prevHistory]);

            return { ...prev, status: 'done', progress: 100 };
          }
          return { ...prev, progress: newProgress };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentBatch]);


  const startBatch = () => {
    if (!selectedFormula || !canProduce) return;

    // Deduct materials
    setMaterials(prevMaterials =>
      prevMaterials.map(mat => {
        const formulaMat = selectedFormula.materials.find(fm => fm.materialId === mat.id);
        if (formulaMat) {
          return { ...mat, quantity: mat.quantity - formulaMat.quantity };
        }
        return mat;
      })
    );
    
    setCurrentBatch({ formula: selectedFormula, status: 'mixing', progress: 0 });
    
    // Reset after a short delay
    setTimeout(() => {
        setCurrentBatch(null);
    }, selectedFormula.mixingTime * 1000 + 2000);
  };
  
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="mr-2 h-4 w-4" />
          Batch History
        </TabsTrigger>
        <TabsTrigger value="ai-advisor">
          <Bot className="mr-2 h-4 w-4" />
          AI Advisor
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="mt-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
          <MaterialInventory materials={materials} />
          <BatchControl 
            formulas={formulas} 
            selectedFormula={selectedFormula}
            setSelectedFormulaId={setSelectedFormulaId}
            canProduce={canProduce}
            startBatch={startBatch}
            currentBatch={currentBatch}
          />
        </div>
      </TabsContent>
      <TabsContent value="history" className="mt-4">
        <BatchHistory history={batchHistory} />
      </TabsContent>
      <TabsContent value="ai-advisor" className="mt-4">
        <AIAdvisor history={batchHistory} />
      </TabsContent>
    </Tabs>
  );
}
