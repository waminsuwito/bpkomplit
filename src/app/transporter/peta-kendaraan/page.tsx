

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useAuth } from '@/context/auth-provider';
import type { Vehicle, Assignment, UserLocation, VehiclePosition } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const VEHICLES_STORAGE_KEY_PREFIX = 'app-vehicles-';
const ASSIGNMENTS_STORAGE_KEY_PREFIX = 'app-assignments-';
const VEHICLE_POSITIONS_KEY = 'app-vehicle-positions';

const containerStyle = {
  width: '100%',
  height: '75vh',
  borderRadius: '0.75rem',
};

// Center of Pekanbaru
const defaultCenter = {
  lat: 0.507067,
  lng: 101.447779,
};

const getVehiclesForLocation = (location: UserLocation): Vehicle[] => {
  try {
    const key = `${VEHICLES_STORAGE_KEY_PREFIX}${location}`;
    const storedVehicles = localStorage.getItem(key);
    return storedVehicles ? JSON.parse(storedVehicles) : [];
  } catch (error) {
    return [];
  }
};

const getAssignments = (location: UserLocation): Assignment[] => {
  try {
    const key = `${ASSIGNMENTS_STORAGE_KEY_PREFIX}${location}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const getVehiclePositions = (): VehiclePosition[] => {
    try {
        const stored = localStorage.getItem(VEHICLE_POSITIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

const saveVehiclePositions = (positions: VehiclePosition[]) => {
    try {
        localStorage.setItem(VEHICLE_POSITIONS_KEY, JSON.stringify(positions));
    } catch (e) {
        console.error("Failed to save vehicle positions", e);
    }
}


export default function PetaKendaraanPage() {
  const { user } = useAuth();
  const [vehiclePositions, setVehiclePositions] = useState<VehiclePosition[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePosition | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const generateAndStorePositions = useCallback(() => {
    if (!user?.location) return;

    const vehicles = getVehiclesForLocation(user.location);
    const assignments = getAssignments(user.location);
    const existingPositions = getVehiclePositions();
    const existingPositionMap = new Map(existingPositions.map(p => [p.id, p]));

    const newPositions = vehicles.map(vehicle => {
      // If position already exists, use it.
      if (existingPositionMap.has(vehicle.id)) {
        // Update operator info just in case it changed
        const assignment = assignments.find(a => a.vehicleId === vehicle.id);
        const existingPosition = existingPositionMap.get(vehicle.id)!;
        existingPosition.operator = assignment?.username || 'Belum ada';
        return existingPosition;
      }

      // If not, generate a new random position around the center
      const assignment = assignments.find(a => a.vehicleId === vehicle.id);
      return {
        id: vehicle.id,
        nomorPolisi: vehicle.nomorPolisi,
        jenis: vehicle.jenisKendaraan,
        operator: assignment?.username || 'Belum ada',
        lat: defaultCenter.lat + (Math.random() - 0.5) * 0.1, // ~11km radius
        lng: defaultCenter.lng + (Math.random() - 0.5) * 0.1,
      };
    });
    
    setVehiclePositions(newPositions);
    saveVehiclePositions(newPositions);

  }, [user]);

  useEffect(() => {
    generateAndStorePositions();
    
    // Simulate position updates every 30 seconds
    const interval = setInterval(() => {
        setVehiclePositions(currentPositions => {
            const updatedPositions = currentPositions.map(p => ({
                ...p,
                lat: p.lat + (Math.random() - 0.5) * 0.001,
                lng: p.lng + (Math.random() - 0.5) * 0.001,
            }));
            saveVehiclePositions(updatedPositions);
            return updatedPositions;
        });
    }, 30000);

    return () => clearInterval(interval);

  }, [generateAndStorePositions]);

  const mapCenter = useMemo(() => {
    if (vehiclePositions.length > 0) {
      const avgLat = vehiclePositions.reduce((sum, p) => sum + p.lat, 0) / vehiclePositions.length;
      const avgLng = vehiclePositions.reduce((sum, p) => sum + p.lng, 0) / vehiclePositions.length;
      return { lat: avgLat, lng: avgLng };
    }
    return defaultCenter;
  }, [vehiclePositions]);


  if (loadError) {
    return (
        <Card>
            <CardHeader><CardTitle>Error Peta</CardTitle></CardHeader>
            <CardContent>
              <p>Gagal memuat Google Maps. Ini bisa disebabkan oleh:</p>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                <li>Kunci API Google Maps tidak valid atau tidak ada.</li>
                <li>API "Maps JavaScript API" belum diaktifkan di Google Cloud Console.</li>
                <li>Masalah penagihan (billing) pada akun Google Cloud Anda.</li>
              </ul>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Peta Posisi Kendaraan
        </CardTitle>
        <CardDescription>
          Lokasi terakhir dari semua kendaraan yang terdaftar. Posisi diperbarui secara berkala.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
          >
            {vehiclePositions.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={{ lat: vehicle.lat, lng: vehicle.lng }}
                onClick={() => setSelectedVehicle(vehicle)}
                icon={{
                    url: '/truck-icon.svg',
                    scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            ))}

            {selectedVehicle && (
              <InfoWindow
                position={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
                onCloseClick={() => setSelectedVehicle(null)}
              >
                <div className="p-1 space-y-1 text-sm">
                  <h4 className="font-bold">{selectedVehicle.nomorPolisi}</h4>
                  <p>Jenis: {selectedVehicle.jenis}</p>
                  <p>Operator: {selectedVehicle.operator}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
            <div className="flex flex-col items-center justify-center h-[75vh] w-full bg-muted rounded-lg">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4"/>
                <p className="text-muted-foreground">Memuat peta...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
