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

export const userRoles = [
  "super_admin",
  "operator",
  "logistik_spareparts",
  "mekanik",
  "kepala_BP",
  "laborat",
  "tukang_las",
  "logistik_material",
] as const;

export type UserRole = (typeof userRoles)[number];

export interface User {
  id: string;
  username: string;
  password?: string; // Optional because we don't fetch it back from a DB
  role: UserRole;
}
