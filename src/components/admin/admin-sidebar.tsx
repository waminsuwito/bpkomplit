
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  FileText, 
  CalendarCheck, 
  PackagePlus, 
  Truck, 
  Anchor, 
  Users,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  AreaChart,
  AlertTriangle,
  Megaphone,
  MapPin
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';

const superAdminNav = [
  { href: '/admin/super-admin', label: 'User Management', icon: Shield },
];

const adminLokasiNav = [
  { href: '/admin/laporan-harian', label: 'Laporan Harian', icon: FileText },
  { href: '/admin/schedule-cor', label: 'Schedule Cor Hari Ini', icon: CalendarCheck },
];

const logistikMaterialNav = [
  { href: '/admin/pemasukan-material', label: 'Pemasukan Material', icon: PackagePlus },
  { href: '/admin/pengiriman-material', label: 'Pengiriman Material', icon: Truck },
  { href: '/admin/bongkar-material', label: 'Bongkar Material', icon: Anchor },
];

const hseHrdNav = [
  { href: '/admin/manajemen-karyawan', label: 'Manajemen Karyawan', icon: Users },
  { href: '/admin/set-lokasi-absensi', label: 'Set Lokasi Absensi', icon: MapPin },
  { href: '/admin/absensi-karyawan-hari-ini', label: 'Absensi Hari Ini', icon: ClipboardCheck },
  { href: '/admin/kegiatan-karyawan-hari-ini', label: 'Kegiatan Hari Ini', icon: ClipboardList },
  { href: '/admin/rangkuman-absensi-karyawan', label: 'Rangkuman Absensi', icon: BarChart3 },
  { href: '/admin/rangkuman-kegiatan-karyawan', label: 'Rangkuman Kegiatan', icon: AreaChart },
  { href: '/admin/insiden-kerja', label: 'Insiden Kerja', icon: AlertTriangle },
  { href: '/admin/broadcast-karyawan', label: 'Broadcast Karyawan', icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  let navItems = [];
  if (user?.role === 'super_admin') {
    navItems = superAdminNav;
  } else if (user?.role === 'admin_lokasi') {
    navItems = adminLokasiNav;
  } else if (user?.role === 'logistik_material') {
    navItems = logistikMaterialNav;
  } else if (user?.role === 'hse_hrd_lokasi') {
    navItems = hseHrdNav;
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex no-print">
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
