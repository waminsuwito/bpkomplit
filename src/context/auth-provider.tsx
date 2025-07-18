
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { type User } from '@/lib/types';
import { getDefaultRouteForUser } from '@/lib/auth-guard-helper';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = ['/dashboard', '/admin', '/admin-bp', '/karyawan'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isLoginPage = pathname === '/';
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (!user && isProtectedRoute) {
      router.replace('/');
    }

    if (user && isLoginPage) {
      router.replace(getDefaultRouteForUser(user));
    }
  }, [isLoading, user, pathname, router]);


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const isAuthCheckRunning = isLoading || (!user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) || (user && pathname === '/');

  if (isAuthCheckRunning) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
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
