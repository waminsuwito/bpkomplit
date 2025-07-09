
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-provider';
import type { DailyActivityReport } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { ClipboardList, User, Image as ImageIcon, Inbox, Clock } from 'lucide-react';

const GLOBAL_ACTIVITIES_KEY = 'app-daily-activities';

export default function KegiatanKaryawanHariIniPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyActivityReport[]>([]);
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!user) return;

    try {
      const storedData = localStorage.getItem(GLOBAL_ACTIVITIES_KEY);
      if (storedData) {
        const allReports: DailyActivityReport[] = JSON.parse(storedData);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const filteredReports = allReports.filter(
          (report) => report.date === today && report.location === user.location
        );
        
        setReports(filteredReports);
      }
    } catch (error) {
      console.error("Failed to load global activity data", error);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Kegiatan Karyawan Hari Ini
        </CardTitle>
        <CardDescription>
          Laporan kegiatan karyawan untuk lokasi {user?.location || '...'} pada tanggal: {tanggalHariIni}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {reports.map((report) => (
              <AccordionItem key={report.userId} value={report.userId}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                     <User className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="font-semibold text-left">{report.username}</p>
                        <p className="text-xs text-muted-foreground font-normal">NIK: {report.nik}</p>
                     </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-8">
                  {/* Sesi Pagi */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Sesi Pagi</h4>
                    {report.pagi?.timestamp ? (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Dilaporkan pada: {format(new Date(report.pagi.timestamp), "HH:mm 'WIB'", { locale: id })}
                        </p>
                        <p className="whitespace-pre-wrap">{report.pagi.text}</p>
                        {report.pagi.photo && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="flex items-center gap-2 text-primary hover:underline text-sm">
                                <ImageIcon className="h-4 w-4" /> Lihat Foto Pagi
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-0">
                               <Image src={report.pagi.photo} alt={`Foto Pagi ${report.username}`} width={1200} height={900} className="rounded-lg object-contain w-full h-auto" />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Belum ada laporan.</p>
                    )}
                  </div>
                  {/* Sesi Siang */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Sesi Siang</h4>
                    {report.siang?.timestamp ? (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Dilaporkan pada: {format(new Date(report.siang.timestamp), "HH:mm 'WIB'", { locale: id })}
                        </p>
                        <p className="whitespace-pre-wrap">{report.siang.text}</p>
                        {report.siang.photo && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="flex items-center gap-2 text-primary hover:underline text-sm">
                                <ImageIcon className="h-4 w-4" /> Lihat Foto Siang
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-0">
                               <Image src={report.siang.photo} alt={`Foto Siang ${report.username}`} width={1200} height={900} className="rounded-lg object-contain w-full h-auto" />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Belum ada laporan.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <Inbox className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Belum Ada Laporan</h3>
            <p className="mt-1 text-sm">Belum ada laporan kegiatan dari karyawan di lokasi Anda untuk hari ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
