
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { ClipboardEdit, Wrench, Inbox, MoreHorizontal } from 'lucide-react';
import type { TruckChecklistReport, TruckChecklistItem, UserLocation } from '@/lib/types';
import { format } from 'date-fns';

const TM_CHECKLIST_STORAGE_KEY = 'app-tm-checklists';
const LOADER_CHECKLIST_STORAGE_KEY = 'app-loader-checklists';
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

type WorkOrderStatus = 'Menunggu' | 'Dikerjakan' | 'Tunda' | 'Selesai';

interface WorkOrder {
  id: string; // Combination of reportId and mechanicId
  mechanicId: string;
  mechanicName: string;
  vehicle: DamagedVehicle;
  startTime: string; // ISO String
  status: WorkOrderStatus;
  completionTime?: string; // ISO String, set when status becomes 'Selesai'
}

export default function WorkOrderPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [damagedVehicles, setDamagedVehicles] = useState<DamagedVehicle[]>([]);
  const [myWorkOrders, setMyWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const loadData = () => {
    if (!user) return;

    // Load all checklist reports from both sources
    const tmChecklistsStr = localStorage.getItem(TM_CHECKLIST_STORAGE_KEY);
    const loaderChecklistsStr = localStorage.getItem(LOADER_CHECKLIST_STORAGE_KEY);
    
    const tmChecklists: TruckChecklistReport[] = tmChecklistsStr ? JSON.parse(tmChecklistsStr) : [];
    const loaderChecklists: TruckChecklistReport[] = loaderChecklistsStr ? JSON.parse(loaderChecklistsStr) : [];
    
    const allChecklists = [...tmChecklists, ...loaderChecklists];

    // Load all existing work orders
    const storedWorkOrders = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    const allWorkOrders: WorkOrder[] = storedWorkOrders ? JSON.parse(storedWorkOrders) : [];

    // Filter for my work orders
    const myCurrentWOs = allWorkOrders.filter(wo => {
        if (wo.mechanicId !== user.id) return false;
        
        if (wo.status !== 'Selesai') {
            return true; // Always show active work orders
        }

        // If status is 'Selesai', check the completion time
        if (wo.status === 'Selesai' && wo.completionTime) {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
            const completionDate = new Date(wo.completionTime);
            return completionDate > twentyFourHoursAgo; // Keep if completed within last 24 hours
        }

        return false; // By default, don't show completed orders without a completion time
    });
    setMyWorkOrders(myCurrentWOs);

    // Create a set of report IDs that are already part of an active work order
    const activeWorkOrderReportIds = new Set(
        allWorkOrders
            .filter(wo => wo.status !== 'Selesai')
            .map(wo => wo.vehicle.reportId)
    );

    // Find checklists with 'rusak' or 'perlu_perhatian' status that are NOT already in an active work order
    const availableDamaged: DamagedVehicle[] = allChecklists
      .map(report => {
        const damagedItems = report.items.filter(item => item.status === 'rusak' || item.status === 'perlu_perhatian');
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
      .filter((v): v is DamagedVehicle => v !== null && !activeWorkOrderReportIds.has(v.reportId))
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
      id: `${vehicleToRepair.reportId}-${user.id}-${Date.now()}`,
      mechanicId: user.id,
      mechanicName: user.username,
      vehicle: vehicleToRepair,
      startTime: new Date().toISOString(),
      status: 'Dikerjakan',
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
  
  const clearVehicleDamageStatus = (reportId: string) => {
      const checklistKeys = [TM_CHECKLIST_STORAGE_KEY, LOADER_CHECKLIST_STORAGE_KEY];
      
      for (const key of checklistKeys) {
          const storedChecklists = localStorage.getItem(key);
          if (storedChecklists) {
              let checklists: TruckChecklistReport[] = JSON.parse(storedChecklists);
              let wasUpdated = false;
              
              const updatedChecklists = checklists.map(report => {
                  if (report.id === reportId) {
                      wasUpdated = true;
                      const repairedItems = report.items.map(item => ({
                          ...item,
                          status: 'baik' as 'baik', // Reset status
                          notes: '', // Clear notes
                          photo: null, // Clear photo
                      }));
                      return { ...report, items: repairedItems };
                  }
                  return report;
              });

              if (wasUpdated) {
                  localStorage.setItem(key, JSON.stringify(updatedChecklists));
                  break; // Stop after finding and updating the report
              }
          }
      }
  };


  const handleUpdateWorkOrderStatus = (workOrder: WorkOrder, status: WorkOrderStatus) => {
    const storedWorkOrders = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    const allWorkOrders: WorkOrder[] = storedWorkOrders ? JSON.parse(storedWorkOrders) : [];

    const updatedWorkOrders = allWorkOrders.map(wo => {
        if (wo.id === workOrder.id) {
            const updatedWo: WorkOrder = { ...wo, status };
            if (status === 'Selesai') {
                updatedWo.completionTime = new Date().toISOString();
            } else {
                delete updatedWo.completionTime; // Remove completion time if status is not 'Selesai'
            }
            return updatedWo;
        }
        return wo;
    });
    
    localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedWorkOrders));
    
    if (status === 'Selesai') {
        clearVehicleDamageStatus(workOrder.vehicle.reportId);
        toast({ title: 'Perbaikan Selesai', description: `Kendaraan ${workOrder.vehicle.userNik} telah selesai diperbaiki.` });
    } else {
        toast({ title: 'Status Diperbarui', description: `Work Order telah diperbarui menjadi "${status}".` });
    }

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
          <CardTitle>List WO Saya</CardTitle>
          <CardDescription>
            Daftar kendaraan yang sedang Anda tangani atau yang ditunda. Laporan yang selesai akan hilang setelah 24 jam.
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
                    <TableHead>Status</TableHead>
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
                       <TableCell className="font-semibold">
                          {wo.status}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Opsi</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateWorkOrderStatus(wo, 'Menunggu')}>
                                    Menunggu
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateWorkOrderStatus(wo, 'Dikerjakan')}>
                                    Dikerjakan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateWorkOrderStatus(wo, 'Tunda')}>
                                    Tunda
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleUpdateWorkOrderStatus(wo, 'Selesai')}>
                                    Selesai
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
