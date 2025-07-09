
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
  "admin_lokasi",
  "operator",
  "logistik_spareparts",
  "mekanik",
  "supervisor",
  "laborat",
  "tukang_las",
  "logistik_material",
  "hse_hrd_lokasi",
  "karyawan",
] as const;

export type UserRole = (typeof userRoles)[number];

export const userLocations = [
  "BP PEKANBARU",
  "BP DUMAI",
  "BP BAUNG",
  "BP IKN",
] as const;

export type UserLocation = (typeof userLocations)[number];

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  location?: UserLocation;
  nik?: string;
}

export interface JobMixFormula {
  id: string;
  mutuBeton: string;
  pasir: number;
  batu: number;
  air: number;
  semen: number;
}

export interface Schedule {
  id: string;
  customerName: string;
  projectLocation: string;
  concreteQuality: string;
  slump: string;
  volume: string;
  mediaCor: 'CP' | 'Manual';
  date: string; // YYYY-MM-DD format
}

export type BongkarStatus = 'Belum Dimulai' | 'Proses' | 'Istirahat' | 'Selesai';

export interface BongkarMaterial {
  id: string;
  namaMaterial: string;
  kapalKendaraan: string;
  namaKaptenSopir: string;
  volume: string;
  keterangan: string;
  waktuMulai: string | null;
  waktuSelesai: string | null;
  status: BongkarStatus;
  waktuMulaiIstirahat: string | null;
  totalIstirahatMs: number;
}

export interface AttendanceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface GlobalAttendanceRecord {
  nik: string;
  nama: string;
  location: UserLocation;
  date: string; // YYYY-MM-DD
  absenMasuk: string | null; // ISO String
  terlambat: string | null; // e.g., "15m" or null
  absenPulang: string | null; // ISO String
  lembur: string | null; // e.g., "1h 30m" or null
  photoMasuk: string | null; // Data URI
  photoPulang: string | null; // Data URI
}
