// This component is no longer used and has been removed as per the new authentication flow.
// The admin panel is now solely for user management.
'use client';
export function MixingProcessForm() {
  return null;
}
export interface MixingProcessStep {
  id: 'aggregates' | 'water' | 'semen';
  name: string;
  order: number;
  delay: number;
}
export interface MixingProcessConfig {
  steps: MixingProcessStep[];
}
