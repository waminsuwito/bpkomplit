

'use client';

import { type User } from '@/lib/types';

const USERS_STORAGE_KEY = 'app-users';

// The default users to seed localStorage with if it's empty.
const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'admin', password: 'admin', jabatan: 'SUPER ADMIN', location: 'BP PEKANBARU', nik: 'SUPER-001' },
  { id: 'op-1', username: 'mirul', password: '123', jabatan: 'OPRATOR BP', location: 'BP PEKANBARU', nik: 'OP-001' },
  { id: 'op-2', username: 'operator_prod', password: 'password', jabatan: 'OPRATOR LOADER', location: 'BP DUMAI', nik: 'OP-002' },
  { id: 'kepmek-1', username: 'kepala_mekanik', password: 'password', jabatan: 'KEPALA MEKANIK', location: 'BP PEKANBARU', nik: 'KEPMEK-001' },
  { id: 'kepws-1', username: 'kepala_workshop', password: 'password', jabatan: 'KEPALA WORKSHOP', location: 'BP DUMAI', nik: 'KWS-001' },
  { id: 'sopirtm-1', username: 'budi_tm', password: 'password', jabatan: 'SOPIR TM', location: 'BP BAUNG', nik: 'SOPIR-001' },
  { id: 'mech-1', username: 'andi_mekanik', password: 'password', jabatan: 'HELPER', location: 'BP BAUNG', nik: 'MECH-001' },
  { id: 'head-1', username: 'supervisor', password: 'password', jabatan: 'KEPALA BP', location: 'BP IKN', nik: 'SUP-001' },
  { id: 'lab-1', username: 'laborat_user', password: 'password', jabatan: 'QC', location: 'BP PEKANBARU', nik: 'LAB-001' },
  { id: 'hse-1', username: 'hse', password: 'hse', jabatan: 'HSE/K3', location: 'BP PEKANBARU', nik: 'HSE-001' },
  { id: 'karyawan-1', username: 'karyawan', password: 'karyawan', jabatan: 'HELPER', location: 'BP PEKANBARU', nik: 'K001' },
  { id: 'admin-logistik-1', username: 'admin_logistik', password: 'password', jabatan: 'ADMIN LOGISTIK', location: 'BP PEKANBARU', nik: 'LOG-001' },
  { id: 'logistik-material-1', username: 'logistik_material', password: 'password', jabatan: 'LOGISTIK MATERIAL', location: 'BP DUMAI', nik: 'LOG-MAT-001' },
  { id: 'admin-bp-1', username: 'admin_bp', password: 'password', jabatan: 'ADMIN BP', location: 'BP PEKANBARU', nik: 'ADMIN-BP-001'},
];

export function getUsers(): User[] {
  // This function is now safe to call from anywhere on the client-side.
  if (typeof window === 'undefined') {
    return []; // Return empty array on server-side or during pre-rendering.
  }
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    } else {
      // Seed the storage if it's the first time.
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
  } catch (error) {
    console.error('Failed to access users from localStorage:', error);
    // Return initial users as a fallback in case of parsing errors.
    return initialUsers;
  }
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
    // getUsers() is safe to call here because this function is only triggered by a user action (form submission).
    const users = getUsers();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === usernameOrNik.toLowerCase() || (u.nik && u.nik.toLowerCase() === usernameOrNik.toLowerCase())) &&
        u.password === password
    );

    setTimeout(() => {
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          resolve(null);
        }
    }, 250); // Simulate network delay
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
