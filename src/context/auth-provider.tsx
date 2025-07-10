
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { verifyLogin } from '@/lib/auth';

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

    // Specific redirection for OPRATOR BP jabatan, takes precedence
    if (userData.jabatan === 'OPRATOR BP') {
      router.push('/dashboard');
    } else if (userData.role === 'super_admin' || userData.role === 'admin_lokasi' || userData.role === 'logistik_material' || userData.role === 'hse_hrd_lokasi') {
      router.push('/admin');
    } else if (userData.role === 'karyawan' || userData.role === 'operator' || userData.role === 'supervisor' || userData.role === 'laborat' || userData.role === 'mekanik' || userData.role === 'tukang_las' || userData.role === 'logistik_spareparts') {
      router.push('/karyawan');
    } else {
      router.push('/'); // Fallback to login page for screen_view or unhandled roles
    }
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
