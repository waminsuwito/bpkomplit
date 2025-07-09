
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/utils';
import { MapPin, Camera, Loader2, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import type { AttendanceLocation, GlobalAttendanceRecord, UserLocation } from '@/lib/types';
import { useAuth } from '@/context/auth-provider';
import { format } from 'date-fns';

const ATTENDANCE_LOCATIONS_KEY = 'app-attendance-locations';
const GLOBAL_ATTENDANCE_KEY = 'app-global-attendance-records';
const ATTENDANCE_RADIUS_METERS = 50000;
const getPersonalAttendanceKey = (userId: string) => `attendance-${userId}-${new Date().toISOString().split('T')[0]}`;

type PersonalAttendanceRecord = {
  clockIn?: string;
  isLate?: boolean;
  clockOut?: string;
};

type AttendanceAction = 'clockIn' | 'clockOut' | 'none';

export default function AbsensiHarianKaryawanPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<AttendanceLocation | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const [personalAttendanceRecord, setPersonalAttendanceRecord] = useState<PersonalAttendanceRecord | null>(null);
  const [currentAction, setCurrentAction] = useState<AttendanceAction>('none');


  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ATTENDANCE_LOCATIONS_KEY);
      if (storedData) {
        setLocations(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load attendance locations from localStorage", error);
    }
    
    if (user) {
      try {
        const storedRecord = localStorage.getItem(getPersonalAttendanceKey(user.id));
        if (storedRecord) {
          setPersonalAttendanceRecord(JSON.parse(storedRecord));
        }
      } catch (error) {
          console.error("Failed to load today's attendance record", error);
      }
    }
  }, [user]);

  useEffect(() => {
    const updateAction = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      const isClockInTime = (hours === 0 && minutes >= 30) || (hours > 0 && hours < 17) || (hours === 17 && minutes < 5);
      const isClockOutTime = (hours === 17 && minutes >= 5) || (hours > 17 && hours <= 23 && (hours !== 23 || minutes <= 55));
      
      setPersonalAttendanceRecord(prevRecord => {
        if (prevRecord?.clockOut) {
          setCurrentAction('none');
        } else if (prevRecord?.clockIn) {
          setCurrentAction(isClockOutTime ? 'clockOut' : 'none');
        } else {
          setCurrentAction(isClockInTime ? 'clockIn' : 'none');
        }
        return prevRecord;
      });
    };

    updateAction();
    const timerId = setInterval(updateAction, 30000); // Check every 30 seconds

    return () => clearInterval(timerId);
  }, [personalAttendanceRecord]);


  const activateCamera = async () => {
    if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      toast({
        variant: 'destructive',
        title: 'Kamera Tidak Didukung',
        description: 'Browser Anda tidak mendukung akses kamera.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Akses Kamera Ditolak',
        description: 'Mohon izinkan akses kamera di pengaturan browser Anda untuk melanjutkan.',
      });
    }
  };

  const updateGlobalAttendance = (updateData: Partial<GlobalAttendanceRecord>) => {
    if (!user || !user.nik) return;
    
    try {
      const storedData = localStorage.getItem(GLOBAL_ATTENDANCE_KEY);
      const allRecords: GlobalAttendanceRecord[] = storedData ? JSON.parse(storedData) : [];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const userRecordIndex = allRecords.findIndex(r => r.nik === user.nik && r.date === today);

      if (userRecordIndex > -1) {
        // Update existing record
        allRecords[userRecordIndex] = { ...allRecords[userRecordIndex], ...updateData };
      } else {
        // Add new record
        const newRecord: GlobalAttendanceRecord = {
          nik: user.nik,
          nama: user.username,
          location: user.location as UserLocation,
          date: today,
          absenMasuk: null,
          terlambat: null,
          absenPulang: null,
          lembur: null,
          ...updateData,
        };
        allRecords.push(newRecord);
      }

      localStorage.setItem(GLOBAL_ATTENDANCE_KEY, JSON.stringify(allRecords));

    } catch (error) {
        console.error("Failed to update global attendance", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan data absensi global.' });
    }
  };
  
  const handleAttendance = () => {
    if (!selectedLocation || currentAction === 'none') {
      toast({ variant: 'destructive', title: 'Aksi Tidak Tersedia', description: 'Pastikan Anda telah memilih lokasi dan berada dalam jam absensi.' });
      return;
    }

    if (!user || !user.nik) {
      toast({ variant: 'destructive', title: 'Absensi Gagal', description: 'Data NIK Anda tidak ditemukan. Hubungi HRD.' });
      return;
    }
    
    setIsCheckingIn(true);
    setAttendanceStatus('idle');
    setStatusMessage('Mendapatkan lokasi Anda...');

    if (!navigator.geolocation) {
      setIsCheckingIn(false);
      setStatusMessage('Geolokasi tidak didukung oleh browser ini.');
      toast({ variant: 'destructive', title: 'Error', description: 'Geolokasi tidak didukung.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const distance = calculateDistance(
          userLat,
          userLon,
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        if (distance <= ATTENDANCE_RADIUS_METERS) {
            const now = new Date();
            
            if (currentAction === 'clockIn') {
                const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 30);
                let terlambatDuration = null;
                if (isLate) {
                    const batasMasuk = new Date(now);
                    batasMasuk.setHours(7, 30, 0, 0);
                    const selisihMs = now.getTime() - batasMasuk.getTime();
                    terlambatDuration = `${Math.floor(selisihMs / 60000)}m`;
                }

                const newPersonalRecord = { clockIn: now.toISOString(), isLate };
                setPersonalAttendanceRecord(newPersonalRecord);
                localStorage.setItem(getPersonalAttendanceKey(user.id), JSON.stringify(newPersonalRecord));

                updateGlobalAttendance({
                  absenMasuk: now.toISOString(),
                  terlambat: terlambatDuration,
                });

                const toastDescription = isLate ? 'Anda tercatat terlambat hari ini.' : 'Absensi masuk berhasil dicatat.';
                toast({ title: 'Absensi Masuk Berhasil', description: toastDescription });
                setAttendanceStatus('success');
                setStatusMessage(`Berhasil absen masuk pada ${now.toLocaleTimeString()}.`);

            } else if (currentAction === 'clockOut') {
                const updatedPersonalRecord = { ...personalAttendanceRecord, clockOut: now.toISOString() };

                setPersonalAttendanceRecord(updatedPersonalRecord as PersonalAttendanceRecord);
                localStorage.setItem(getPersonalAttendanceKey(user.id), JSON.stringify(updatedPersonalRecord));
                
                updateGlobalAttendance({ absenPulang: now.toISOString() });

                toast({ title: 'Absensi Pulang Berhasil', description: 'Absensi pulang berhasil dicatat.' });
                setAttendanceStatus('success');
                setStatusMessage(`Berhasil absen pulang pada ${now.toLocaleTimeString()}.`);
            }
        } else {
          setAttendanceStatus('failed');
          const failMsg = `Anda terlalu jauh! Jarak Anda ${distance.toFixed(0)} meter dari lokasi. Radius yang diizinkan adalah ${ATTENDANCE_RADIUS_METERS} meter.`;
          setStatusMessage(failMsg);
          toast({ variant: 'destructive', title: 'Absensi Gagal', description: 'Anda berada di luar radius yang diizinkan.' });
        }
        setIsCheckingIn(false);
      },
      (error) => {
        setIsCheckingIn(false);
        setAttendanceStatus('failed');
        let errMsg = 'Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.';
        if (error.code === error.PERMISSION_DENIED) {
            errMsg = 'Izin lokasi ditolak. Mohon aktifkan di pengaturan browser.';
        }
        setStatusMessage(errMsg);
        toast({ variant: 'destructive', title: 'Error Lokasi', description: errMsg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const getButtonText = () => {
    if (isCheckingIn) return 'Memvalidasi...';
    switch (currentAction) {
      case 'clockIn': return 'Absen Masuk Sekarang';
      case 'clockOut': return 'Absen Pulang Sekarang';
      default:
        if (personalAttendanceRecord?.clockIn && !personalAttendanceRecord.clockOut) {
          return 'Belum Waktunya Absen Pulang';
        }
        if (personalAttendanceRecord?.clockOut) {
          return 'Absensi Hari Ini Selesai';
        }
        return 'Di Luar Jam Absensi';
    }
  };

  const isButtonDisabled = isCheckingIn || hasCameraPermission !== true || locations.length === 0 || !selectedLocation || currentAction === 'none';

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Absensi Harian (Selfie)
        </CardTitle>
        <CardDescription>
          Pilih lokasi, aktifkan kamera, lalu lakukan absensi. Pastikan Anda berada dalam radius 50000 meter.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Lokasi Batching Plant</label>
           <Select onValueChange={(value) => setSelectedLocation(locations.find(l => l.name === value) || null)} disabled={locations.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={locations.length > 0 ? "Pilih lokasi Anda..." : "Tidak ada lokasi dikonfigurasi"} />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
           <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
           
           {hasCameraPermission !== true && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-background p-4 text-center">
                {hasCameraPermission === null ? (
                    <>
                        <Camera className="h-12 w-12 mb-4 text-primary" />
                        <h3 className="text-lg font-bold">Aktifkan Kamera untuk Absensi</h3>
                        <p className="text-sm text-muted-foreground mb-4">Aplikasi memerlukan izin untuk menggunakan kamera Anda.</p>
                        <Button onClick={activateCamera} disabled={!selectedLocation}>
                            <Camera className="mr-2 h-4 w-4" />
                            Aktifkan Kamera
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-destructive/90 text-destructive-foreground p-6 rounded-lg">
                        <XCircle className="h-10 w-10 mb-2"/>
                        <p className="font-bold">Akses Kamera Ditolak</p>
                        <p className="text-sm text-center mt-1">Mohon segarkan halaman dan berikan izin kamera di pengaturan browser Anda.</p>
                     </div>
                )}
             </div>
           )}
        </div>

        {personalAttendanceRecord?.clockIn && (
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-500">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Status Absensi Hari Ini</AlertTitle>
                <AlertDescription>
                   <p>Masuk: <span className="font-semibold">{new Date(personalAttendanceRecord.clockIn).toLocaleTimeString('id-ID')}</span> {personalAttendanceRecord.isLate && <span className="text-destructive font-bold">(Terlambat)</span>}</p>
                   {personalAttendanceRecord.clockOut && <p>Pulang: <span className="font-semibold">{new Date(personalAttendanceRecord.clockOut).toLocaleTimeString('id-ID')}</span></p>}
                </AlertDescription>
            </Alert>
        )}
        
        {statusMessage && (
           <Alert variant={attendanceStatus === 'success' ? 'default' : attendanceStatus === 'failed' ? 'destructive' : 'default'} className={attendanceStatus === 'success' ? 'bg-green-100 dark:bg-green-900/40 border-green-500' : ''}>
              {attendanceStatus === 'success' && <CheckCircle className="h-4 w-4" />}
              {attendanceStatus === 'failed' && <XCircle className="h-4 w-4" />}
              {isCheckingIn && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertTitle>
                  {attendanceStatus === 'success' ? 'Berhasil!' : attendanceStatus === 'failed' ? 'Gagal!' : 'Status'}
              </AlertTitle>
              <AlertDescription>
                {statusMessage}
              </AlertDescription>
            </Alert>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={handleAttendance} disabled={isButtonDisabled} className="w-full" size="lg">
          {isCheckingIn ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            currentAction === 'clockIn' ? <LogIn className="mr-2 h-5 w-5" /> :
            currentAction === 'clockOut' ? <LogOut className="mr-2 h-5 w-5" /> :
            <MapPin className="mr-2 h-5 w-5" />
          )}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
