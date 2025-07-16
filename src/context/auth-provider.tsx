
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User } from '@/lib/types';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded SUPER ADMIN user for direct access
const superAdminUser: Omit<User, 'password'> = {
  id: 'superadmin-main',
  username: 'admin',
  jabatan: 'SUPER ADMIN',
  location: 'BP PEKANBARU',
  nik: 'SUPER-001'
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Force login as SUPER ADMIN immediately
    setUser(superAdminUser);
    localStorage.setItem('user', JSON.stringify(superAdminUser));
    setIsLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const value = { user, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
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
