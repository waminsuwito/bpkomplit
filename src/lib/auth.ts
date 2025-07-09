
'use client';

import { type User } from '@/lib/types';

const USERS_STORAGE_KEY = 'app-users';

// The default users to seed localStorage with if it's empty.
const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'admin', password: 'admin', role: 'super_admin', location: 'BP PEKANBARU', nik: 'SUPER-001' },
  { id: 'op-1', username: 'mirul', password: '123', role: 'operator', location: 'BP PEKANBARU', nik: 'OP-001', jabatan: 'OPRATOR BP' },
  { id: 'op-2', username: 'operator_prod', password: 'password', role: 'operator', location: 'BP DUMAI', nik: 'OP-002', jabatan: 'OPRATOR LOADER' },
  { id: 'kepmek-1', username: 'kepala_mekanik', password: 'password', role: 'karyawan', location: 'BP PEKANBARU', nik: 'KEPMEK-001', jabatan: 'KEPALA MEKANIK' },
  { id: 'kepws-1', username: 'kepala_workshop', password: 'password', role: 'karyawan', location: 'BP DUMAI', nik: 'KWS-001', jabatan: 'KEPALA WORKSHOP' },
  { id: 'sopirtm-1', username: 'budi_tm', password: 'password', role: 'karyawan', location: 'BP BAUNG', nik: 'SOPIR-001', jabatan: 'SOPIR TM' },
  { id: 'mech-1', username: 'andi_mekanik', password: 'password', role: 'mekanik', location: 'BP BAUNG', nik: 'MECH-001', jabatan: 'HELPER' },
  { id: 'head-1', username: 'supervisor', password: 'password', role: 'supervisor', location: 'BP IKN', nik: 'SUP-001' },
  { id: 'lab-1', username: 'laborat_user', password: 'password', role: 'laborat', location: 'BP PEKANBARU', nik: 'LAB-001' },
  { id: 'hse-1', username: 'hse', password: 'hse', role: 'hse_hrd_lokasi', location: 'BP PEKANBARU', nik: 'HSE-001' },
  { id: 'karyawan-1', username: 'karyawan', password: 'karyawan', role: 'karyawan', location: 'BP PEKANBARU', nik: 'K001', jabatan: 'HELPER' },
];

function getInitialUsers(): User[] {
  if (typeof window !== 'undefined') {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        return JSON.parse(storedUsers);
      } else {
        // If no users are stored, seed with initial users
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
        return initialUsers;
      }
    } catch (error) {
      console.error('Failed to access users from localStorage:', error);
      return initialUsers; // Fallback
    }
  }
  return [];
}


export function getUsers(): User[] {
  return getInitialUsers();
}

export function saveUsers(users: User[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users to localStorage:', error);
    }
  }
}

export function verifyLogin(usernameOrNik: string, password: string): Promise<Omit<User, 'password'> | null> {
  return new Promise((resolve) => {
    const users = getUsers();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === usernameOrNik.toLowerCase() || (u.nik && u.nik.toLowerCase() === usernameOrNik.toLowerCase())) &&
        u.password === password
    );

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      resolve(userWithoutPassword);
    } else {
      resolve(null);
    }
  });
}

export function addUser(userData: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = { ...userData, id: new Date().toISOString() };
  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  return newUser;
}

export function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): void {
  const users = getUsers();
  const updatedUsers = users.map((u) =>
    u.id === userId ? { ...u, ...userData } : u
  );
  saveUsers(updatedUsers);
}

export function deleteUser(userId: string): void {
  const users = getUsers();
  const updatedUsers = users.filter((u) => u.id !== userId);
  saveUsers(updatedUsers);
}

export function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      resolve({ success: false, message: 'User not found.' });
      return;
    }

    const user = users[userIndex];

    if (user.password !== oldPassword) {
      resolve({ success: false, message: 'Incorrect old password.' });
      return;
    }

    // Update password
    users[userIndex].password = newPassword;
    saveUsers(users);

    resolve({ success: true, message: 'Password updated successfully.' });
  });
}
