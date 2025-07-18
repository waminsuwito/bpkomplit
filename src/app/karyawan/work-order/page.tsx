
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { ClipboardEdit, Wrench, CheckCircle, Inbox } from 'lucide-react';
import type { TruckChecklistReport, TruckChecklistItem, UserLocation } from '@/lib/types';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

const CHECKLIST_STORAGE_KEY = 'app-tm-checklists';
const WORK_ORDER_STORAGE_KEY = 'app-work-orders';

interface DamagedVehicle {
  reportId: string;
  userId: string;
  userNik: string;
  username: string;
  location: UserLocation;
  timestamp: string;
  damagedItems: TruckChecklistItem[];
}

interface WorkOrder {
  id: string; // Combination of reportId and mechanicId
  mechanicId: string;
  mechanicName: string;
  vehicle: DamagedVehicle;
  startTime: string; // ISO String
  status: 'Dalam Pengerjaan' | 'Selesai';
}

export default function WorkOrderPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [damagedVehicles, setDamagedVehicles] = useState<DamagedVehicle[]>([]);
  const [myWorkOrders, setMyWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const loadData = () => {
    if (!user) return;

    // Load all checklist reports
    const storedChecklists = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const allChecklists: TruckChecklistReport[] = storedChecklists ? JSON.parse(storedChecklists) : [];

    // Load all existing work orders
    const storedWorkOrders = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    const allWorkOrders: WorkOrder[] = storedWorkOrders ? JSON.parse(storedWorkOrders) : [];

    // Filter for my work orders
    const myCurrentWOs = allWorkOrders.filter(wo => wo.mechanicId === user.id && wo.status === 'Dalam Pengerjaan');
    setMyWorkOrders(myCurrentWOs);

    const workOrderReportIds = new Set(allWorkOrders.map(wo => wo.vehicle.reportId));

    // Find checklists with 'rusak' status that are NOT already in a work order
    const availableDamaged: DamagedVehicle[] = allChecklists
      .map(report => {
        const damagedItems = report.items.filter(item => item.status === 'rusak');
        if (damagedItems.length > 0) {
          return {
            reportId: report.id,
            userId: report.userId,
            userNik: report.userNik,
            username: report.username,
            location: report.location,
            timestamp: report.timestamp,
            damagedItems: damagedItems,
          };
        }
        return null;
      })
      .filter((v): v is DamagedVehicle => v !== null && !workOrderReportIds.has(v.reportId))
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
    setDamagedVehicles(availableDamaged);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateWorkOrder = () => {
    if (!selectedVehicleId || !user) {
      toast({ variant: 'destructive', title: 'Pilih Kendaraan', description: 'Anda harus memilih kendaraan yang rusak terlebih dahulu.' });
      return;
    }

    const vehicleToRepair = damagedVehicles.find(v => v.reportId === selectedVehicleId);
    if (!vehicleToRepair) {
      toast({ variant: 'destructive', title: 'Kendaraan tidak ditemukan', description: 'Kendaraan yang dipilih tidak lagi tersedia.' });
      return;
    }

    const newWorkOrder: WorkOrder = {
      id: `${vehicleToRepair.reportId}-${user.id}`,
      mechanicId: user.id,
      mechanicName: user.username,
      vehicle: vehicleToRepair,
      startTime: new Date().toISOString(),
      status: 'Dalam Pengerjaan',
    };

    const storedWorkOrders = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    const allWorkOrders: WorkOrder[] = storedWorkOrders ? JSON.parse(storedWorkOrders) : [];
    allWorkOrders.push(newWorkOrder);
    localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(allWorkOrders));

    toast({ title: 'Work Order Dibuat', description: `Anda sekarang mengerjakan kendaraan NIK ${vehicleToRepair.userNik}` });
    
    // Refresh lists
    setSelectedVehicleId(null);
    loadData();
  };

  const handleCompleteWorkOrder = (workOrderId: string) => {
    const storedWorkOrders = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    const allWorkOrders: WorkOrder[] = storedWorkOrders ? JSON.parse(storedWorkOrders) : [];

    const updatedWorkOrders = allWorkOrders.map(wo => 
        wo.id === workOrderId ? { ...wo, status: 'Selesai' as const } : wo
    );
    
    localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedWorkOrders));
    toast({ title: 'Perbaikan Selesai', description: 'Work Order telah ditandai sebagai selesai.' });
    loadData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardEdit className="h-6 w-6 text-primary" />
            Work Order (WO)
          </CardTitle>
          <CardDescription>
            Pilih kendaraan dari daftar untuk memulai perbaikan dan membuat Work Order baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dari daftar kendaraan rusak..." />
                </SelectTrigger>
                <SelectContent>
                  {damagedVehicles.length > 0 ? damagedVehicles.map(vehicle => (
                    <SelectItem key={vehicle.reportId} value={vehicle.reportId}>
                      {`[${format(new Date(vehicle.timestamp), "d/MM HH:mm")}] - Opr: ${vehicle.username} (NIK: ${vehicle.userNik}) - Lokasi: ${vehicle.location}`}
                    </SelectItem>
                  )) : <SelectItem value="none" disabled>Tidak ada kendaraan rusak yang tersedia</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateWorkOrder} disabled={!selectedVehicleId}>
              <Wrench className="mr-2 h-4 w-4" /> Perbaiki
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>List WO Saya (Dalam Pengerjaan)</CardTitle>
          <CardDescription>
            Daftar kendaraan yang sedang Anda tangani.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myWorkOrders.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operator</TableHead>
                    <TableHead>NIK Kendaraan</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Detail Kerusakan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myWorkOrders.map(wo => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.vehicle.username}</TableCell>
                      <TableCell>{wo.vehicle.userNik}</TableCell>
                      <TableCell>{wo.vehicle.location}</TableCell>
                      <TableCell>
                        <ul className="list-disc pl-5 space-y-1">
                          {wo.vehicle.damagedItems.map(item => (
                            <li key={item.id}>
                              <span className="font-semibold">{item.label}:</span>
                              <p className="whitespace-pre-wrap pl-2 text-sm text-muted-foreground">{item.notes || "Tidak ada catatan."}</p>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="default" size="sm" onClick={() => handleCompleteWorkOrder(wo.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Tandai Selesai
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Inbox className="mx-auto h-12 w-12" />
              <p className="mt-2">Anda tidak memiliki Work Order yang sedang aktif.</p>
              <p className="text-sm">Pilih kendaraan dari daftar di atas untuk memulai.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
