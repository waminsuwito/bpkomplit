
'use client';

import { useState } from 'react';
import { verifyLogin } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, LogIn } from 'lucide-react';
import { AuthGuard, getDefaultRouteForUser } from '@/components/auth/auth-guard';
import { type User } from '@/lib/types';

function LoginPageContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const loggedInUser = await verifyLogin(username, password);
      
      if (loggedInUser) {
        // Step 1: Save user to localStorage
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        
        // Step 2: Determine destination
        const destination = getDefaultRouteForUser(loggedInUser);
        
        // Step 3: Force a full page reload to the destination.
        // This is the key to fixing the race condition. It ensures AuthProvider
        // re-reads from localStorage in a clean state.
        window.location.href = destination;
        
      } else {
        throw new Error('Username, NIK, atau password salah.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };
  
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

export default function LoginPage() {
    return (
        <AuthGuard>
            <LoginPageContent />
        </AuthGuard>
    )
}
