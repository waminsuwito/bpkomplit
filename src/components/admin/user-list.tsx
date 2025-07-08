'use client';

import { type User, type UserRole } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface UserListProps {
  users: Omit<User, 'password'>[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const roleVariantMap: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    super_admin: 'destructive',
    admin_lokasi: 'secondary',
    operator: 'default',
    kepala_BP: 'secondary',
    laborat: 'secondary',
    logistik_material: 'outline',
    logistik_spareparts: 'outline',
    mekanik: 'outline',
    tukang_las: 'outline',
};

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  
  if (users.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No users found.</p>
            <p>Create a new user above to see them here.</p>
        </div>
    )
  }

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>
                <Badge variant={roleVariantMap[user.role] || 'default'}>{formatRoleName(user.role)}</Badge>
              </TableCell>
              <TableCell>{user.location || 'N/A'}</TableCell>
              <TableCell className="flex justify-center items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(user.id)} disabled={user.id === 'superadmin-main'}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={user.role === 'super_admin'}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user 
                        <span className="font-semibold"> {user.username}</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(user.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
