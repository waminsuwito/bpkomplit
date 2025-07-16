
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User } from '@/lib/types';
import { getUsers } from '@/lib/auth'; // Import getUsers to find the admin user from DB

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
    const checkUser = async () => {
      try {
        // Try to get user from localStorage first for faster page loads
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
            // This is a fallback to ensure the superadmin is always available
            // if localStorage is cleared or on first visit.
            const allUsers = await getUsers();
            const superAdminUser = allUsers.find(u => u.id === 'superadmin-main');
            if (superAdminUser) {
                const { password, ...adminData } = superAdminUser;
                setUser(adminData);
                localStorage.setItem('user', JSON.stringify(adminData));
            }
        }
      } catch (e) {
        console.error("Failed to initialize auth state", e);
      } finally {
        // Only set loading to false after all async operations are complete
        setIsLoading(false);
      }
    };
    checkUser();
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
