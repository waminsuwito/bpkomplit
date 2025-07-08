'use client';

import type { Schedule } from '@/lib/types';

const SCHEDULES_STORAGE_KEY = 'app-schedules';

export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedSchedules = window.localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return storedSchedules ? JSON.parse(storedSchedules) : [];
  } catch (error) {
    console.error('Failed to access schedules from localStorage:', error);
    return [];
  }
}

export function saveSchedules(schedules: Schedule[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Failed to save schedules to localStorage:', error);
  }
}
