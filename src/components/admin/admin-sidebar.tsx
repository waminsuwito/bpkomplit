
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
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  AreaChart,
  AlertTriangle,
  Megaphone,
  MapPin,
  MailQuestion,
  ShieldAlert
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useState, useEffect } from 'react';
import type { AnonymousReport } from '@/lib/types';


const superAdminNav = [
  { href: '/admin/super-admin', label: 'User Management', icon: Shield },
  { href: '/admin/pesan-anonim', label: 'Pesan dari Anonim', icon: MailQuestion },
];

const adminLokasiNav = [
  { href: '/admin/laporan-harian', label: 'Laporan Harian', icon: FileText },
  { href: '/admin/schedule-cor', label: 'Schedule Cor Hari Ini', icon: CalendarCheck },
  { href: '/admin/laporan-anonim', label: 'Laporan Anonim', icon: ShieldAlert },
];

const logistikMaterialNav = [
  { href: '/admin/pemasukan-material', label: 'Pemasukan Material', icon: PackagePlus },
  { href: '/admin/pengiriman-material', label: 'Pengiriman Material', icon: Truck },
  { href: '/admin/bongkar-material', label: 'Bongkar Material', icon: Anchor },
  { href: '/admin/laporan-anonim', label: 'Laporan Anonim', icon: ShieldAlert },
];

const hseHrdNav = [
  { href: '/admin/absensi-karyawan-hari-ini', label: 'Absensi Hari Ini', icon: ClipboardCheck },
  { href: '/admin/set-lokasi-absensi', label: 'Set Lokasi Absensi', icon: MapPin },
  { href: '/admin/kegiatan-karyawan-hari-ini', label: 'Kegiatan Hari Ini', icon: ClipboardList },
  { href: '/admin/rangkuman-absensi-karyawan', label: 'Rangkuman Absensi', icon: BarChart3 },
  { href: '/admin/rangkuman-kegiatan-karyawan', label: 'Rangkuman Kegiatan', icon: AreaChart },
  { href: '/admin/insiden-kerja', label: 'Insiden Kerja', icon: AlertTriangle },
  { href: '/admin/broadcast-karyawan', label: 'Broadcast Karyawan', icon: Megaphone },
  { href: '/admin/laporan-anonim', label: 'Laporan Anonim', icon: ShieldAlert },
];

const ANONYMOUS_REPORTS_KEY = 'app-anonymous-reports';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasUnreadReports, setHasUnreadReports] = useState(false);

  useEffect(() => {
    if (user?.role !== 'super_admin') return;

    const checkUnread = () => {
      try {
        const storedData = localStorage.getItem(ANONYMOUS_REPORTS_KEY);
        if (storedData) {
          const reports: AnonymousReport[] = JSON.parse(storedData);
          const unread = reports.some(r => r.status === 'new');
          setHasUnreadReports(unread);
        } else {
          setHasUnreadReports(false);
        }
      } catch (error) {
        console.error("Failed to check for unread reports", error);
        setHasUnreadReports(false);
      }
    };

    checkUnread();
    
    // Check for changes in local storage. This is more efficient than polling.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ANONYMOUS_REPORTS_KEY) {
        checkUnread();
      }
    };

    // Also listen for custom events for when a report is marked as read
    const handleReportsUpdated = () => checkUnread();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('reportsUpdated', handleReportsUpdated);


    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reportsUpdated', handleReportsUpdated);
    };
  }, [user]);

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
              'justify-start relative'
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
            {item.href === '/admin/pesan-anonim' && hasUnreadReports && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
