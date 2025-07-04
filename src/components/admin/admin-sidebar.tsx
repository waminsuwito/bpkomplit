'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const navItems = [
  { href: '/admin/formulas', label: 'Job Mix Formulas', icon: ClipboardList },
  { href: '/admin/mixing-process', label: 'Mixing Process', icon: Wrench },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
