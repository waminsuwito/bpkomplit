
'use client';

import { type User } from '@/lib/types';
import { getDatabase, ref, get, set, child } from "firebase/database";
import { app } from '@/lib/firebase';

const USERS_PATH = 'users';

const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'admin', password: '123', jabatan: 'SUPER ADMIN', location: 'BP PEKANBARU', nik: 'SUPER-001' },
  { id: 'super-admin-2', username: 'SUPER ADNMIN', password: '1', jabatan: 'SUPER ADMIN', location: 'BP PEKANBARU', nik: 'SUPER-002' },
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

async function seedInitialUsers(): Promise<void> {
    const db = getDatabase(app);
    const usersObject = initialUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);
    await set(ref(db, USERS_PATH), usersObject);
    console.log("Database was empty. Seeded initial users.");
}

export async function getUsers(): Promise<User[]> {
    try {
        const dbRef = ref(getDatabase(app));
        const snapshot = await get(child(dbRef, USERS_PATH));
        if (snapshot.exists()) {
            const usersObject = snapshot.val();
            // Convert the object of users into an array, which is the correct format.
            return Object.values(usersObject) as User[];
        } else {
            // If no users exist in the database, seed them and return the seeded list.
            await seedInitialUsers();
            return initialUsers;
        }
    } catch (error) {
        console.error('Firebase Error: Failed to get users.', error);
        // Fallback to initial users list if there's a DB connection error
        return [];
    }
}

async function saveUsers(users: User[]): Promise<void> {
    try {
        const db = getDatabase(app);
        const usersObject = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
        await set(ref(db, USERS_PATH), usersObject);
    } catch (error) {
        console.error('Firebase Error: Failed to save users.', error);
        // Optionally re-throw or handle the error as needed
        throw error;
    }
}

export async function verifyLogin(usernameOrNik: string, password: string): Promise<Omit<User, 'password'> | null> {
    const users = await getUsers();
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

export async function addUser(userData: Omit<User, 'id'>): Promise<User> {
    const users = await getUsers();
    const newUser: User = { ...userData, id: new Date().toISOString() + Math.random().toString(36).substring(2) };
    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    return newUser;
}

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    const users = await getUsers();
    const updatedUsers = users.map((u) =>
        u.id === userId ? { ...u, ...userData } : u
    );
    await saveUsers(updatedUsers);
}

export async function deleteUser(userId: string): Promise<void> {
    const users = await getUsers();
    const updatedUsers = users.filter((u) => u.id !== userId);
    await saveUsers(updatedUsers);
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = await getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    const user = users[userIndex];
    if (user.password !== oldPassword) {
        return { success: false, message: 'Incorrect old password.' };
    }

    users[userIndex].password = newPassword;
    await saveUsers(users);

    return { success: true, message: 'Password updated successfully.' };
}
