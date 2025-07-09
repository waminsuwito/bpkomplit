
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { format } from 'date-fns';
import { ClipboardList, Camera, Loader2, Video, VideoOff, CheckCircle, Save, Info } from 'lucide-react';
import type { DailyActivityReport, DailyActivity } from '@/lib/types';
import Image from 'next/image';

const GLOBAL_ACTIVITIES_KEY = 'app-daily-activities';
const getPersonalActivityKey = (userId: string) => `daily-activity-${userId}-${format(new Date(), 'yyyy-MM-dd')}`;

type Session = 'pagi' | 'siang';

export default function KegiatanSayaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [report, setReport] = useState<Partial<DailyActivityReport>>({});
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [pagiText, setPagiText] = useState('');
  const [siangText, setSiangText] = useState('');
  const [pagiPhoto, setPagiPhoto] = useState<string | null>(null);
  const [siangPhoto, setSiangPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      try {
        const storedReport = localStorage.getItem(getPersonalActivityKey(user.id));
        if (storedReport) {
          const parsedReport: DailyActivityReport = JSON.parse(storedReport);
          setReport(parsedReport);
          setPagiText(parsedReport.pagi?.text || '');
          setPagiPhoto(parsedReport.pagi?.photo || null);
          setSiangText(parsedReport.siang?.text || '');
          setSiangPhoto(parsedReport.siang?.photo || null);
        }
      } catch (error) {
        console.error("Failed to load today's activity report", error);
      }
    }

    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 100 + minutes;

      if (currentTime >= 730 && currentTime < 1200) {
        setCurrentSession('pagi');
      } else if (currentTime >= 1300 && currentTime < 1700) {
        setCurrentSession('siang');
      } else {
        setCurrentSession(null);
        if (isCameraActive) stopCamera();
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, isCameraActive]);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleActivateCamera = async () => {
    if (isCameraActive) {
      stopCamera();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Kamera Gagal', description: 'Gagal mengakses kamera. Mohon berikan izin.' });
    }
  };

  const capturePhoto = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && isCameraActive) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        stopCamera();
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const handleCaptureAndSetPhoto = () => {
    const photoDataUri = capturePhoto();
    if (photoDataUri && currentSession) {
      if (currentSession === 'pagi') {
        setPagiPhoto(photoDataUri);
      } else {
        setSiangPhoto(photoDataUri);
      }
    }
  };
  
  const handleSave = async (session: Session) => {
    if (!user || !user.nik || !user.location) {
      toast({ variant: 'destructive', title: 'Gagal', description: 'Data pengguna tidak lengkap.' });
      return;
    }

    setIsLoading(true);

    const activityText = session === 'pagi' ? pagiText : siangText;
    const activityPhoto = session === 'pagi' ? pagiPhoto : siangPhoto;

    if (!activityText.trim()) {
        toast({ variant: 'destructive', title: 'Gagal', description: 'Mohon isi deskripsi kegiatan.' });
        setIsLoading(false);
        return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const personalKey = getPersonalActivityKey(user.id);
    
    // 1. Get existing reports (personal and global)
    const storedPersonal = localStorage.getItem(personalKey);
    const currentPersonalReport: DailyActivityReport = storedPersonal ? JSON.parse(storedPersonal) : {
        userId: user.id,
        nik: user.nik,
        username: user.username,
        location: user.location,
        date: todayStr,
        pagi: { text: null, photo: null, timestamp: null },
        siang: { text: null, photo: null, timestamp: null },
    };

    const storedGlobal = localStorage.getItem(GLOBAL_ACTIVITIES_KEY);
    const allGlobalReports: DailyActivityReport[] = storedGlobal ? JSON.parse(storedGlobal) : [];

    // 2. Update the report data for the specific session
    const updatedSessionData: DailyActivity = {
        text: activityText,
        photo: activityPhoto,
        timestamp: new Date().toISOString()
    };
    currentPersonalReport[session] = updatedSessionData;
    
    if (session === 'pagi') {
        setPagiText(activityText);
        setPagiPhoto(activityPhoto);
    } else {
        setSiangText(activityText);
        setSiangPhoto(activityPhoto);
    }

    // 3. Update global report
    const globalReportIndex = allGlobalReports.findIndex(r => r.userId === user.id && r.date === todayStr);
    if (globalReportIndex > -1) {
        allGlobalReports[globalReportIndex] = currentPersonalReport;
    } else {
        allGlobalReports.push(currentPersonalReport);
    }

    // 4. Save back to localStorage
    try {
        localStorage.setItem(personalKey, JSON.stringify(currentPersonalReport));
        localStorage.setItem(GLOBAL_ACTIVITIES_KEY, JSON.stringify(allGlobalReports));
        toast({ title: 'Berhasil', description: `Laporan kegiatan ${session} telah disimpan.` });
    } catch (error) {
        console.error('Failed to save report', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan laporan ke localStorage.' });
    } finally {
        setIsLoading(false);
    }
  };

  const renderSessionCard = (session: Session, title: string, text: string, setText: (val: string) => void, photo: string | null, setPhoto: (val: string | null) => void) => {
    const isSessionActive = currentSession === session;
    const isSaved = (session === 'pagi' && report.pagi?.timestamp) || (session === 'siang' && report.siang?.timestamp);

    return (
      <Card className={!isSessionActive && !isSaved ? 'bg-muted/50' : ''}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {!isSessionActive && !isSaved && <CardDescription>Belum memasuki waktu laporan sesi ini.</CardDescription>}
          {isSaved && <CardDescription className="text-primary flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Laporan sesi ini sudah disimpan.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`kegiatan-${session}`}>Deskripsi Kegiatan</Label>
            <Textarea
              id={`kegiatan-${session}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Tuliskan kegiatan Anda di sesi ${session} di sini...`}
              rows={5}
              disabled={!isSessionActive || isLoading || isSaved}
            />
          </div>
          <div>
            <Label>Foto Kegiatan</Label>
            {photo ? (
              <div className="mt-2 space-y-2">
                <Image src={photo} alt={`Foto ${session}`} width={300} height={225} className="rounded-md border" />
                <Button variant="outline" size="sm" onClick={() => setPhoto(null)} disabled={!isSessionActive || isLoading || isSaved}>
                  Ulangi Foto
                </Button>
              </div>
            ) : (
                isCameraActive && currentSession === session ? (
                    <div className="mt-2 space-y-2">
                        <div className="relative aspect-video w-full max-w-sm bg-muted rounded-md overflow-hidden border">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
                        </div>
                        <Button onClick={handleCaptureAndSetPhoto} disabled={!isSessionActive || isLoading}>
                            <Camera className="mr-2"/> Ambil Foto
                        </Button>
                    </div>
                ) : (
                     <Button variant="secondary" onClick={handleActivateCamera} disabled={!isSessionActive || isLoading || isSaved}>
                        <Video className="mr-2"/> Buka Kamera
                    </Button>
                )
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSave(session)} disabled={!isSessionActive || isLoading || isSaved}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
            Simpan Laporan {title}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Laporan Kegiatan Harian
          </CardTitle>
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Petunjuk</AlertTitle>
            <AlertDescription>
              Isi laporan kegiatan pagi antara pukul 07:30 - 12:00 dan kegiatan siang antara pukul 13:00 - 17:00.
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>
      
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid md:grid-cols-2 gap-6">
        {renderSessionCard('pagi', 'Kegiatan Pagi', pagiText, setPagiText, pagiPhoto, setPagiPhoto)}
        {renderSessionCard('siang', 'Kegiatan Siang', siangText, setSiangText, siangPhoto, setSiangPhoto)}
      </div>
    </div>
  );
}
