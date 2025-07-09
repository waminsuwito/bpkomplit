
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/utils';
import { MapPin, Camera, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

// Data Lokasi Batching Plant (nantinya bisa diambil dari database)
const bpLocations: Location[] = [
  { name: 'BP PEKANBARU', latitude: 0.507067, longitude: 101.447779 },
  { name: 'BP DUMAI', latitude: 1.6242, longitude: 101.4449 },
  { name: 'BP BAUNG', latitude: 0.6358, longitude: 101.6917 },
  { name: 'BP IKN', latitude: -0.9754, longitude: 116.9926 },
];

const ATTENDANCE_RADIUS_METERS = 50;

export default function AbsensiHarianKaryawanPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
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
    getCameraPermission();
  }, [toast]);
  
  const handleClockIn = () => {
    if (!selectedLocation) {
      toast({ variant: 'destructive', title: 'Lokasi Belum Dipilih', description: 'Silakan pilih lokasi Batching Plant Anda.' });
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
          // Logika sukses absensi
          setAttendanceStatus('success');
          const successMsg = `Absensi berhasil! Jarak Anda ${distance.toFixed(0)} meter dari ${selectedLocation.name}.`;
          setStatusMessage(successMsg);
          toast({ title: 'Absensi Berhasil', description: `Tercatat pada ${new Date().toLocaleTimeString()}`});
          // Di sini Anda akan menambahkan logika untuk menyimpan data ke Firestore, termasuk gambar dari video stream.
        } else {
          // Logika gagal absensi
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

  const isButtonDisabled = isCheckingIn || hasCameraPermission === false;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Absensi Harian (Selfie)
        </CardTitle>
        <CardDescription>
          Pilih lokasi Anda dan ambil foto selfie untuk melakukan absensi. Pastikan Anda berada dalam radius 50 meter dari lokasi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Lokasi Batching Plant</label>
           <Select onValueChange={(value) => setSelectedLocation(bpLocations.find(l => l.name === value) || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi Anda..." />
            </SelectTrigger>
            <SelectContent>
              {bpLocations.map(loc => (
                <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
           <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ transform: "scaleX(-1)" }} />
           {hasCameraPermission === null && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
               <Loader2 className="h-8 w-8 animate-spin text-white" />
             </div>
           )}
           {hasCameraPermission === false && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 text-destructive-foreground p-4">
                <XCircle className="h-10 w-10 mb-2"/>
                <p className="font-bold">Akses Kamera Diperlukan</p>
                <p className="text-sm text-center">Mohon segarkan halaman dan izinkan akses kamera untuk melanjutkan.</p>
             </div>
           )}
        </div>
        
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
        <Button onClick={handleClockIn} disabled={isButtonDisabled} className="w-full" size="lg">
          {isCheckingIn ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-5 w-5" />
          )}
          {isCheckingIn ? 'Memvalidasi Lokasi...' : 'Absen Masuk Sekarang'}
        </Button>
      </CardFooter>
    </Card>
  );
}
