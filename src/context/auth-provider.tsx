
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { verifyLogin, type User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.jabatan) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
    }
    switch(user.role) {
      case 'super_admin': return '/admin/super-admin';
      case 'admin_lokasi': return '/admin/laporan-harian';
      case 'logistik_material': return '/admin/pemasukan-material';
      case 'hse_hrd': return '/admin/absensi-karyawan-hari-ini';
      case 'karyawan': return '/karyawan/absensi-harian';
      default: return '/';
    }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string) => {
    const loggedInUser = await verifyLogin(username, pass);
    if (loggedInUser) {
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      toast({ title: `Selamat datang Sdr. ${loggedInUser.username}` });
      const destination = getDefaultRouteForUser(loggedInUser);
      router.push(destination);
    } else {
      throw new Error('Username, NIK, atau password salah.');
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
