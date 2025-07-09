'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { verifyLogin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading: isAuthLoading } = useAuth();
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
      const user = await verifyLogin(username, password);
      if (user) {
        toast({ title: 'Login Successful', description: `Welcome, ${user.username}!` });
        login(user);
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

  const isLoading = isAuthLoading || isVerifying;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image
            src="https://i.ibb.co/V0NgdX7z/images.jpg"
            alt="Company Logo"
            width={80}
            height={80}
            className="mx-auto rounded-lg mb-4"
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
