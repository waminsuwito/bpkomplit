
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User } from '@/lib/types';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs ONLY ONCE on initial app load.
    // Its only job is to check localStorage for an existing session.
    try {
      // --- SIMULATION START ---
      // Hardcode the SUPER ADMIN user to simulate automatic login.
      const superAdminUser: Omit<User, 'password'> = {
        id: 'superadmin-main',
        username: 'admin',
        jabatan: 'SUPER ADMIN',
        location: 'BP PEKANBARU',
        nik: 'SUPER-001'
      };
      setUser(superAdminUser);
      // --- SIMULATION END ---
      
      /* Original code:
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      */
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once.

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Force a reload to the login page to ensure a clean state.
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
