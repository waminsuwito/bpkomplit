'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole, type UserLocation } from '@/lib/types';
import { getUsers, saveUsers } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';


export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleSaveUser = (data: UserFormValues, userId: string | null) => {
    let updatedUsers: User[];

    if (userId) {
      // Update existing user
      updatedUsers = users.map(u => {
        if (u.id === userId) {
          const updatedUser: User = {
            ...u,
            username: data.username,
            role: data.role as UserRole,
            location: data.location as UserLocation,
          };
          // Only update password if a new one was entered
          if (data.password) {
            updatedUser.password = data.password;
          }
          return updatedUser;
        }
        return u;
      });
    } else {
      // Add new user
      if (!data.password) {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: 'Password is required for new users.',
        });
        return;
      }
      const newUser: User = { 
        id: new Date().toISOString(),
        username: data.username,
        password: data.password,
        role: data.role as UserRole,
        location: data.location as UserLocation,
      };
      updatedUsers = [...users, newUser];
    }
    
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
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
    const updatedUsers = users.filter(u => u.id !== id)
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
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
