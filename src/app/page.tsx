
'use client';

import { useState, useEffect } from 'react';
import { verifyLogin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, LogIn } from 'lucide-react';
import { getDefaultRouteForUser } from '@/components/auth/auth-guard';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';

function LoginPageContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // The setTimeout is removed to make the login process synchronous and more reliable.
    const loggedInUser = verifyLogin(username, password);
    
    if (loggedInUser) {
        try {
            // 1. Save user to localStorage
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            // 2. Determine the destination
            const destination = getDefaultRouteForUser(loggedInUser);
            // 3. Force a full page reload to the destination. This is the key fix.
            // It ensures a clean state and prevents race conditions.
            window.location.href = destination;
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Login Gagal',
                description: 'Gagal menyimpan sesi login. Mohon coba lagi.',
            });
            setIsLoading(false);
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Login Gagal',
            description: 'Username, NIK, atau password salah.',
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
            alt="PT. FARIKA RIAU PERKASA Logo"
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
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoCapitalize="none"
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
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // This effect only redirects if a user is already logged in.
        // It avoids the race condition that was happening before.
        if (!isLoading && user) {
            const destination = getDefaultRouteForUser(user);
            router.replace(destination);
        }
    }, [user, isLoading, router]);

    // While checking for a user, or if a user is found and redirect is pending, show loader.
    if (isLoading || user) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If no user and not loading, show the login page.
    return <LoginPageContent />;
}
