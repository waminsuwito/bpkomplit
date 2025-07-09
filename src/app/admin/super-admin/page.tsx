
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole, type UserLocation } from '@/lib/types';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';


export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();

  const handleSaveUser = (data: UserFormValues, userId: string | null) => {
    const isKaryawan = data.role === 'karyawan';
    
    if (userId) { // Update existing user
      const userDataToUpdate: Partial<User> = {
        username: data.username,
        role: data.role as UserRole,
        location: data.location as UserLocation,
        nik: isKaryawan ? data.nik : undefined,
      };
      if (data.password) {
        userDataToUpdate.password = data.password;
      }
      updateUser(userId, userDataToUpdate);
      setUsers(getUsers()); // Re-fetch from storage to reflect changes
    } else { // Add new user
       if (!data.password) {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: 'Password is required for new users.',
        });
        return;
      }
      const newUser: Omit<User, 'id'> = {
        username: data.username,
        password: data.password,
        role: data.role as UserRole,
        location: data.location as UserLocation,
        nik: isKaryawan ? data.nik : undefined,
      };
      addUser(newUser);
      setUsers(getUsers()); // Re-fetch from storage
    }
    setUserToEdit(null);
  };
  
  const handleEditUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setUserToEdit(user);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    setUsers(getUsers()); // Re-fetch from storage
  };

  const handleCancelEdit = () => {
    setUserToEdit(null);
  };

  // We need to pass users without their passwords to the list component for display
  const usersForDisplay = users.map(({ password, ...user }) => user);

  return (
    <div className="w-full max-w-4xl space-y-6 mx-auto">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Shield className="h-6 w-6 text-primary" />
             {userToEdit ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <CardDescription>
            {userToEdit ? `Editing user: ${userToEdit.username}` : 'Add a new user and assign them a role.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            onSave={handleSaveUser}
            userToEdit={userToEdit}
            onCancel={handleCancelEdit}
          />
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
          <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View, edit, or delete existing users.</CardDescription>
          </CardHeader>
          <CardContent>
              <UserList users={usersForDisplay} onEdit={handleEditUser} onDelete={handleDeleteUser} />
          </CardContent>
      </Card>
    </div>
  );
}
