

export const MIXING_PROCESS_STORAGE_KEY = 'mixingProcessConfig';

export interface MixingProcessStep {
  id: 'aggregates' | 'water' | 'semen';
  name: string;
  order: number;
  delay: number;
}
export interface MixingProcessConfig {
  steps: MixingProcessStep[];
}


export const defaultMixingProcess: MixingProcessConfig = {
  steps: [
    { id: 'aggregates', name: 'Pasir & Batu', order: 1, delay: 0 },
    { id: 'water', name: 'Air', order: 1, delay: 7 },
    { id: 'semen', name: 'Semen', order: 2, delay: 0 },
  ],
};
