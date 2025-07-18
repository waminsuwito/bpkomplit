
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

// Hardcoded admin user for automatic login
const hardcodedAdminUser: Omit<User, 'password'> = {
  id: 'superadmin-main',
  username: 'admin',
  jabatan: 'SUPER ADMIN',
  location: 'BP PEKANBARU',
  nik: 'SUPER-001',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Automatically log in as the hardcoded admin user
    setUser(hardcodedAdminUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until the hardcoded user is set
    }

    const isLoginPage = pathname === '/';

    // If the user is on the login page, redirect them to their default dashboard
    if (user && isLoginPage) {
      router.replace(getDefaultRouteForUser(user));
    }
    
  }, [isLoading, user, pathname, router]);

  const logout = () => {
    // In this "no-login" setup, logout just reloads to log back in automatically.
    // To truly log out, one would need to clear the hardcoded user logic.
    window.location.href = '/';
  };
  
  // Show a loader while the initial user setup and redirection logic runs.
  const isAuthCheckRunning = isLoading || (user && pathname === '/');

  if (isAuthCheckRunning) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, isLoading: false }}>
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
