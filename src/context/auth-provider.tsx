"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUsers } from '@/lib/auth'; // Import the function to get users

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (userData: Omit<User, 'password'>) => void;
  logout: () => void;
  isLoading: boolean;
  isDashboardAdmin: boolean;
  loginDashboardAdmin: (password: string) => Promise<boolean>;
  logoutDashboardAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardAdmin, setIsDashboardAdmin] = useState(false);
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
    if (userData.role === 'super_admin' || userData.role === 'admin_lokasi') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsDashboardAdmin(false); // Reset admin mode on full logout
    router.push('/');
  };

  const loginDashboardAdmin = async (password: string): Promise<boolean> => {
    if (!user) return false;

    // Get the full, current user list from storage for verification
    const allUsers = getUsers();
    const userWithPassword = allUsers.find(u => u.id === user.id);
    
    const canAccess = user.role === 'kepala_BP' || user.role === 'super_admin';

    if (userWithPassword && userWithPassword.password === password && canAccess) {
      setIsDashboardAdmin(true);
      return true;
    }
    
    return false;
  };

  const logoutDashboardAdmin = () => {
    setIsDashboardAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isDashboardAdmin, loginDashboardAdmin, logoutDashboardAdmin }}>
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
