
'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, Shield, KeyRound, Lock, Loader2, Fingerprint, ArrowLeft, Settings, SlidersHorizontal, Cog, FileText, Timer } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword } from '@/lib/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


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
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
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

  const showAdvancedSettings = user?.role === 'supervisor' || user?.role === 'super_admin';

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
              <p className="text-xs text-muted-foreground">{user.jabatan || formatRoleName(user.role)}</p>
            </div>
            
             {user?.jabatan === 'OPRATOR BP' && pathname.startsWith('/dashboard') && (
              <Button asChild variant="outline" size="sm">
                <Link href="/karyawan">
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Absen & Kegiatan
                </Link>
              </Button>
            )}
            
            {user.role === 'super_admin' && !isAdminPage && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/super-admin">
                  <Shield className="mr-2 h-4 w-4" />
                  User Management
                </Link>
              </Button>
            )}
            
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Setting
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href="/dashboard/relay-settings">
                         <SlidersHorizontal className="mr-2 h-4 w-4" />
                         <span>Setting Relay</span>
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/mixer-timer-settings">
                        <Timer className="mr-2 h-4 w-4" />
                        <span>Timer Pintu Mixer</span>
                      </Link>
                    </DropdownMenuItem>
                    {showAdvancedSettings && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/mixing-settings">
                          <Cog className="mr-2 h-4 w-4" />
                          <span>Pengaturan Lanjutan</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/job-mix-formula">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Job Mix Formula</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Ubah Password</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
