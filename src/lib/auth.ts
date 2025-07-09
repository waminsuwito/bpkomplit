'use client';

import { type User } from '@/lib/types';

const USERS_STORAGE_KEY = 'app-users';

// The default users to seed localStorage with if it's empty.
const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'admin', password: 'admin', role: 'super_admin', location: 'BP PEKANBARU' },
  { id: 'op-1', username: 'mirul', password: '123', role: 'operator', location: 'BP PEKANBARU' },
  { id: 'op-2', username: 'operator_prod', password: 'password', role: 'operator', location: 'BP DUMAI' },
  { id: 'mech-1', username: 'andi_mekanik', password: 'password', role: 'mekanik', location: 'BP BAUNG' },
  { id: 'head-1', username: 'supervisor', password: 'password', role: 'supervisor', location: 'BP IKN' },
  { id: 'lab-1', username: 'laborat_user', password: 'password', role: 'laborat', location: 'BP PEKANBARU' },
  { id: 'hse-1', username: 'hse', password: 'hse', role: 'hse_hrd_lokasi', location: 'BP PEKANBARU' },
  { id: 'karyawan-1', username: 'karyawan', password: 'karyawan', role: 'karyawan', location: 'BP PEKANBARU' },
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

export function verifyLogin(username: string, password: string): Promise<Omit<User, 'password'> | null> {
  return new Promise((resolve) => {
    const users = getUsers(); // Ensures seeding happens if needed
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
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
