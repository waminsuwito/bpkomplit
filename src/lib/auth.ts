import { type User } from '@/lib/types';

// In a real application, this would be a database call.
// Passwords should be hashed.
export const users: User[] = [
  { id: 'superadmin-main', username: 'admin', password: 'admin', role: 'super_admin', location: 'BP PEKANBARU' },
  { id: 'op-mirul', username: 'mirul', password: '123', role: 'operator', location: 'BP PEKANBARU' },
  { id: '2', username: 'operator_prod', password: 'password', role: 'operator', location: 'BP DUMAI' },
  { id: '3', username: 'andi_mekanik', password: 'password', role: 'mekanik', location: 'BP BAUNG' },
  { id: '4', username: 'kepala_bp', password: 'password', role: 'kepala_BP', location: 'BP IKN' },
  { id: '5', username: 'laborat_user', password: 'password', role: 'laborat', location: 'BP PEKANBARU' },
];

export async function verifyLogin(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}
