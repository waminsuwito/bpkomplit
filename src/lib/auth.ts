
'use client';

import { type User } from '@/lib/types';

// The key used to store users in localStorage.
const USERS_STORAGE_KEY = 'app-users';

// The initial set of users to seed the application with if none are found.
const initialUsers: User[] = [
  { id: 'owner-main', username: 'owner', password: '123', jabatan: 'OWNER', location: 'BP PEKANBARU', nik: 'OWNER-001' },
  { id: 'superadmin-main', username: 'admin', password: '123', jabatan: 'SUPER ADMIN', location: 'BP PEKANBARU', nik: 'SUPER-001' },
  { id: 'superadmin-new', username: 'superadmin', password: 'superadmin', jabatan: 'SUPER ADMIN', location: 'BP PEKANBARU', nik: 'SUPER-999' },
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

/**
 * Retrieves the list of users from localStorage.
 * If no users are found, it seeds localStorage with an initial list.
 * This function should only be called on the client side.
 * @returns {User[]} An array of user objects.
 */
export function getUsers(): User[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            // Seed the initial users into localStorage if it's empty
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
            return initialUsers;
        }
    } catch (error) {
        console.error('Failed to access users from localStorage:', error);
        return [];
    }
}

/**
 * Saves the provided array of users to localStorage.
 * This function should only be called on the client side.
 * @param {User[]} users The array of users to save.
 */
function saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('Failed to save users to localStorage:', error);
    }
}


export function verifyLogin(usernameOrNik: string, password: string): Omit<User, 'password'> | null {
    const users = getUsers();
    const lowerCaseUsernameOrNik = usernameOrNik.toLowerCase();

    const user = users.find(
        (u) =>
            (u.username.toLowerCase() === lowerCaseUsernameOrNik || (u.nik && u.nik.toLowerCase() === lowerCaseUsernameOrNik)) &&
            u.password === password
    );

    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } else {
        return null;
    }
}

export function addUser(userData: Omit<User, 'id'>): User {
    const users = getUsers();
    const newUser: User = { ...userData, id: new Date().toISOString() + Math.random().toString(36).substring(2) };
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

export function changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; message: string } {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    const user = users[userIndex];
    if (user.password !== oldPassword) {
        return { success: false, message: 'Incorrect old password.' };
    }

    users[userIndex].password = newPassword;
    saveUsers(users);

    return { success: true, message: 'Password updated successfully.' };
}
