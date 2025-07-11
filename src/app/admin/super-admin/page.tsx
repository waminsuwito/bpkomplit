
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole, type UserLocation, type UserJabatan } from '@/lib/types';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';


export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Safely load users on the client side after the component has mounted
    setUsers(getUsers());
    setIsLoading(false);
  }, []);

  const handleSaveUser = (data: UserFormValues, userId: string | null) => {
    const allUsers = getUsers();
    const nikExists = allUsers.some(
      (user) => user.nik === data.nik && user.id !== userId
    );

    if (nikExists) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `NIK "${data.nik}" sudah digunakan oleh pengguna lain.`,
      });
      return;
    }
    
    if (userId) { // Update existing user
      const userDataToUpdate: Partial<User> = {
        username: data.username,
        role: data.role as UserRole,
        location: data.location as UserLocation,
        nik: data.nik,
        jabatan: data.role !== 'super_admin' ? (data.jabatan as UserJabatan) || undefined : undefined,
      };
      if (data.password) {
        userDataToUpdate.password = data.password;
      }
      updateUser(userId, userDataToUpdate);
      setUsers(getUsers()); // Re-fetch from storage to reflect changes
      toast({ title: 'User Updated', description: `User "${data.username}" has been updated.` });
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
        nik: data.nik,
        jabatan: data.role !== 'super_admin' ? (data.jabatan as UserJabatan) || undefined : undefined,
      };
      addUser(newUser);
      setUsers(getUsers()); // Re-fetch from storage
      toast({ title: 'User Created', description: `User "${data.username}" has been created.` });
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

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Loading user data...</p>
        </div>
    );
  }

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
