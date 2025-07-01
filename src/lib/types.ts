import type { LucideIcon } from 'lucide-react';

export interface Material {
  id: string;
  name: string;
  quantity: number;
  capacity: number;
  unit: string;
  Icon: LucideIcon;
  lowLevelThreshold: number;
}

export interface Formula {
  id: string;
  name: string;
  materials: {
    materialId: string;
    quantity: number;
  }[];
  mixingTime: number; // in seconds
}

export interface Batch {
  id: string;
  formula: Formula;
  timestamp: string;
  status: 'Completed' | 'Failed' | 'In Progress';
  deviations?: string;
}
