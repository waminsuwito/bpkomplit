
'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, Shield, KeyRound, Lock, Loader2, Fingerprint } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword } from '@/lib/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AttendanceForm } from '@/components/karyawan/attendance-form';


const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Password lama harus diisi.' }),
    newPassword: z.string().min(6, { message: 'Password baru minimal 6 karakter.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru tidak cocok.',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export function Header() {
  const { user, logout, isDashboardAdmin, loginDashboardAdmin, logoutDashboardAdmin } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  
  const { toast } = useToast();

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  
  const { isSubmitting: isChangingPassword } = passwordForm.formState;

  const handlePasswordChange = async (values: PasswordFormValues) => {
    if (!user) return;
    const result = await changePassword(user.id, values.oldPassword, values.newPassword);
    if (result.success) {
      toast({ title: 'Berhasil', description: result.message });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } else {
      toast({ variant: 'destructive', title: 'Gagal', description: result.message });
    }
  };


  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const success = await loginDashboardAdmin(password);
    if (success) {
      toast({ title: "Admin Access Granted", description: "You can now manage formulas." });
      setIsAdminLoginOpen(false);
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
            
            {pathname.startsWith('/dashboard') && user.jabatan === 'OPRATOR BP' && (
              <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Absen
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="w-screen h-screen max-w-full sm:rounded-none border-0 p-0 flex items-center justify-center">
                      <DialogHeader className="sr-only">
                          <DialogTitle>Absensi Harian</DialogTitle>
                          <DialogDescription>Formulir untuk melakukan absensi masuk dan pulang.</DialogDescription>
                      </DialogHeader>
                      <AttendanceForm />
                  </DialogContent>
              </Dialog>
            )}

            {/* In-Dashboard Admin for Formulas */}
            {(user.role === 'supervisor' || user.role === 'super_admin') && !isAdminPage && (
              <>
                {isDashboardAdmin ? (
                  <Button variant="destructive" size="sm" onClick={logoutDashboardAdmin}>
                    <Lock className="mr-2 h-4 w-4" />
                    Exit Admin Mode
                  </Button>
                ) : (
                  <Dialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen}>
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
            
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Ubah Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ubah Password</DialogTitle>
                  <DialogDescription>
                    Masukkan password lama dan password baru Anda di bawah ini.
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="oldPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Lama</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Masukkan password lama" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Baru</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Masukkan password baru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi Password Baru</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Konfirmasi password baru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

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
