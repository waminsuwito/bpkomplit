import { type User } from '@/lib/types';

// This is the initial seed data. It will be used only if localStorage is empty.
const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'admin', password: 'admin', role: 'super_admin', location: 'BP PEKANBARU' },
  { id: 'op-mirul', username: 'mirul', password: '123', role: 'operator', location: 'BP PEKANBARU' },
  { id: '2', username: 'operator_prod', password: 'password', role: 'operator', location: 'BP DUMAI' },
  { id: '3', username: 'andi_mekanik', password: 'password', role: 'mekanik', location: 'BP BAUNG' },
  { id: '4', username: 'kepala_bp', password: 'password', role: 'kepala_BP', location: 'BP IKN' },
  { id: '5', username: 'laborat_user', password: 'password', role: 'laborat', location: 'BP PEKANBARU' },
];

const USERS_STORAGE_KEY = 'app-users';

// --- User Data Persistence ---

// In a real app, these functions would interact with a database via API calls.
// For this prototype, we use localStorage to simulate persistence.

export function getUsers(): User[] {
  if (typeof window === 'undefined') {
    return initialUsers;
  }
  try {
    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    } else {
      // If no users in storage, initialize with default data
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
  } catch (error) {
    console.error('Failed to access users from localStorage:', error);
    return initialUsers;
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
}


// --- Authentication ---

export async function verifyLogin(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const allUsers = getUsers();
    const user = allUsers.find(u => u.username === username && u.password === password);
    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}
