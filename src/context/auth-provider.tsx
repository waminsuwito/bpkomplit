
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';

// Helper function to determine the correct default page for a user
const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    if (user.jabatan === 'OPRATOR BP') return '/dashboard';
    
    const roleRedirects: Partial<Record<UserRole, string>> = {
        'super_admin': '/admin/super-admin',
        'admin_lokasi': '/admin/laporan-harian',
        'logistik_material': '/admin/pemasukan-material',
        'hse_hrd_lokasi': '/admin/absensi-karyawan-hari-ini'
    };
    
    if (roleRedirects[user.role]) {
        return roleRedirects[user.role]!;
    }
    
    if (user.role.startsWith('karyawan') || user.role === 'operator') {
        return '/karyawan/absensi-harian';
    }

    return '/'; // Default fallback
};


interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (userData: Omit<User, 'password'>) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: Omit<User, 'password'>) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // REMOVED ROUTER.PUSH FROM HERE.
    // The AuthGuard on the destination page will handle the redirect if the user is already logged in.
    // Or the login page itself will redirect.
    const destination = getDefaultRouteForUser(userData);
    router.push(destination);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
