import type { MixingProcessConfig } from '@/components/admin/mixing-process-form';

export const MIXING_PROCESS_STORAGE_KEY = 'mixingProcessConfig';

export const defaultMixingProcess: MixingProcessConfig = {
  steps: [
    { id: 'aggregates', name: 'Pasir & Batu', order: 1, delay: 0 },
    { id: 'water', name: 'Air', order: 1, delay: 7 },
    { id: 'semen', name: 'Semen', order: 2, delay: 0 },
  ],
};
