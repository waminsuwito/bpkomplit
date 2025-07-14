
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fingerprint, ClipboardList, Megaphone, ShieldAlert, AlertTriangle, Lightbulb, MessageSquareWarning, ArrowLeft, ClipboardCheck, Construction, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { Separator } from '@/components/ui/separator';

export function KaryawanSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const baseNavItems = [
    { href: '/karyawan/absensi-harian', label: 'Absensi Harian', icon: Fingerprint },
    { href: '/karyawan/kegiatan-saya', label: 'Kegiatan Saya', icon: ClipboardList },
    { href: '/karyawan/broadcast', label: 'Broadcast', icon: Megaphone },
    { href: '/karyawan/laporkan-accident', label: 'Laporkan Accident', icon: AlertTriangle },
    { href: '/karyawan/usulan-saya', label: 'Usulan Saya', icon: Lightbulb },
    { href: '/karyawan/komplain-saya', label: 'Komplain Saya', icon: MessageSquareWarning },
    { href: '/karyawan/laporan-anonim', label: 'Laporan Anonim', icon: ShieldAlert },
  ];

  let navItems = [...baseNavItems];
  
  let insertionIndex = 1; // The position to insert new items (after Absensi Harian)

  // Conditionally insert the checklist item for the correct user role
  if (user?.role === 'SOPIR TM') {
      navItems.splice(insertionIndex, 0, {
          href: '/karyawan/checklist-harian-tm',
          label: 'Checklist Harian TM',
          icon: ClipboardCheck,
      });
      insertionIndex++;
  }

  // Conditionally insert the management items for the correct user role
  if (user?.role === 'KEPALA MEKANIK' || user?.role === 'KEPALA WORKSHOP') {
      navItems.splice(insertionIndex, 0, 
        {
            href: '/karyawan/manajemen-alat',
            label: 'Status Armada Hari Ini',
            icon: Construction,
        },
        {
            href: '/karyawan/manajemen-peralatan',
            label: 'Manajemen Alat',
            icon: Wrench,
        }
      );
  }


  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex no-print">
      <nav className="flex flex-col gap-2">
        {user?.role === 'OPRATOR BP' && (
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
              </Link>
            </Button>
            <Separator className="my-2" />
          </>
        )}
        <h2 className="mb-2 text-lg font-semibold tracking-tight">Menu Karyawan</h2>
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
