'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, Shield, KeyRound, Lock, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, logout, isDashboardAdmin, loginDashboardAdmin, logoutDashboardAdmin } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const success = await loginDashboardAdmin(password);
    if (success) {
      toast({ title: "Admin Access Granted", description: "You can now manage formulas." });
      setIsDialogOpen(false);
      setPassword('');
    } else {
      toast({ variant: 'destructive', title: "Login Failed", description: "Incorrect password." });
    }
    setIsLoginLoading(false);
  };

  return (
    <>
      <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10 no-print">
        <div className="flex items-center gap-4">
          <Image
            src="https://i.ibb.co/V0NgdX7z/images.jpg"
            alt="PT. FARIKA RIAU PERKASA Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary">PT. FARIKA RIAU PERKASA</h1>
            <p className="text-sm text-muted-foreground">One Stop Concrete Solution</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" />
                {user.username}
              </p>
              <p className="text-xs text-muted-foreground">{formatRoleName(user.role)}</p>
            </div>

            {/* In-Dashboard Admin for Formulas */}
            {(user.role === 'supervisor' || user.role === 'super_admin') && !isAdminPage && (
              <>
                {isDashboardAdmin ? (
                  <Button variant="destructive" size="sm" onClick={logoutDashboardAdmin}>
                    <Lock className="mr-2 h-4 w-4" />
                    Exit Admin Mode
                  </Button>
                ) : (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Formula Management
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Administrator Login</DialogTitle>
                        <DialogDescription>
                          Enter your password to manage job mix formulas.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAdminLogin}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="admin-password">
                              Password for {user.username}
                            </Label>
                            <Input
                              id="admin-password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                           <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                          <Button type="submit" disabled={isLoginLoading}>
                            {isLoginLoading ? <Loader2 className="animate-spin" /> : "Login"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}

            {/* User Management Admin for Super Admin */}
            {user.role === 'super_admin' && !isAdminPage && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/super-admin">
                  <Shield className="mr-2 h-4 w-4" />
                  User Management
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </header>
    </>
  );
}
