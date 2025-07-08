
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole, type UserLocation } from '@/lib/types';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';


export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const firestoreUsers = await getUsers();
        setUsers(firestoreUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch users from the database.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const handleSaveUser = async (data: UserFormValues, userId: string | null) => {
    if (userId) { // Update existing user
      const userDataToUpdate: Partial<User> = {
        username: data.username,
        role: data.role as UserRole,
        location: data.location as UserLocation,
      };
      if (data.password) {
        userDataToUpdate.password = data.password;
      }
      await updateUser(userId, userDataToUpdate);
      setUsers(users.map(u => u.id === userId ? { ...u, ...userDataToUpdate } : u));
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
      };
      const addedUser = await addUser(newUser);
      setUsers([...users, addedUser]);
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

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleCancelEdit = () => {
    setUserToEdit(null);
  };

  // We need to pass users without their passwords to the list component for display
  const usersForDisplay = users.map(({ password, ...user }) => user);

  if (isLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading users from database...</p>
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
