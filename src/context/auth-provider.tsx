
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { verifyLogin, type User, type Jabatan } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (username: string, pass: string) => Promise<Omit<User, 'password'>>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.jabatan) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      default: // Continue to check role-based routing
        break;
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
  const pathname = usePathname();
  const { toast } = useToast();

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

  useEffect(() => {
    // This effect handles redirection after login or on page refresh for a logged-in user.
    if (!isLoading && user) {
      const defaultRoute = getDefaultRouteForUser(user);
      // Redirect from login page to default route if user is already logged in
      if (pathname === '/') {
        router.replace(defaultRoute);
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (username: string, pass: string): Promise<Omit<User, 'password'>> => {
    const loggedInUser = await verifyLogin(username, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      toast({ title: `Selamat datang Sdr. ${loggedInUser.username}` });
      return loggedInUser;
    } else {
      throw new Error('Username, NIK, atau password salah.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.replace('/');
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
