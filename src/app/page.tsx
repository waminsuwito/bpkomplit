
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import { verifyLogin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

const getDefaultRouteForUser = (user: Omit<User, 'password'>): string => {
    switch(user.role) {
      case 'OPRATOR BP': return '/dashboard';
      case 'ADMIN BP': return '/admin-bp/schedule-cor-hari-ini';
      case 'SUPER ADMIN': return '/admin/super-admin';
      case 'ADMIN LOGISTIK': return '/admin/laporan-harian';
      case 'LOGISTIK MATERIAL': return '/admin/pemasukan-material';
      case 'HSE/K3': return '/admin/absensi-karyawan-hari-ini';
      case 'KEPALA MEKANIK':
      case 'KEPALA WORKSHOP':
        return '/karyawan/manajemen-alat';
      default: return '/karyawan/absensi-harian';
    }
};


export default function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    try {
      const loggedInUser = await verifyLogin(username, password);
      if (loggedInUser) {
        toast({ title: `Selamat datang Sdr. ${loggedInUser.username}` });
        login(loggedInUser); // Update the user state
        // The useEffect below will handle the redirect once the state is updated
      } else {
        const errorMessage = 'Username, NIK, atau password salah.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: errorMessage,
        });
        setIsVerifying(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not connect to the server.',
        });
      setIsVerifying(false);
    }
  };
  
  // This effect will run ONLY after the `user` state has been updated by the `login` function.
  useEffect(() => {
    if (user && !isAuthLoading) {
        const destination = getDefaultRouteForUser(user);
        router.replace(destination);
    }
  }, [user, isAuthLoading, router]);

  const isLoading = isAuthLoading || isVerifying;

  // Show a loading spinner if the user is already authenticated and we're just waiting for the redirect.
  if (isAuthLoading || user) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Mengalihkan...</p>
              </div>
          </div>
      );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={120}
            height={120}
            className="mx-auto rounded-full mb-4"
          />
          <CardTitle className="text-2xl text-primary">PT. FARIKA RIAU PERKASA</CardTitle>
          <CardDescription>
            One Stop Concrete Solution
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username atau NIK</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username atau NIK"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
