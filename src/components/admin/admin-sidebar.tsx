'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';

const superAdminNav = [
  { href: '/admin/super-admin', label: 'User Management', icon: Shield },
];

const adminLokasiNav = [
  { href: '/admin/laporan-harian', label: 'Laporan Harian', icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  let navItems = [];
  if (user?.role === 'super_admin') {
    navItems = superAdminNav;
  } else if (user?.role === 'admin_lokasi') {
    navItems = adminLokasiNav;
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <nav className="flex flex-col gap-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Admin Menu</h2>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({
                variant: pathname.startsWith(item.href) ? 'default' : 'ghost',
              }),
              'justify-start'
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
