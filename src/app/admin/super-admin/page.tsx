'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole, type UserLocation } from '@/lib/types';
import { users as initialUsersData } from '@/lib/auth';

// In a real app, you would fetch and update users via an API.
// For this prototype, we manage the user list in the client-side state.
// Note: Changes made here won't persist across page reloads.

export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsersData.map(({ password, ...user }) => user));
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleSaveUser = (data: UserFormValues, userId: string | null) => {
    if (userId) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === userId 
        ? { 
            ...u, 
            username: data.username, 
            role: data.role as UserRole,
            location: data.location as UserLocation,
            // Password is not saved in this prototype state
          } 
        : u
      ));
    } else {
      // Add new user
      const newUser: User = { 
        id: new Date().toISOString(),
        username: data.username,
        role: data.role as UserRole,
        location: data.location as UserLocation,
      };
      setUsers([...users, newUser]);
    }
    setUserToEdit(null); // Reset edit state
  };
  
  const handleEditUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setUserToEdit(user);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleCancelEdit = () => {
    setUserToEdit(null);
  };

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
              <UserList users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
          </CardContent>
      </Card>
    </div>
  );
}
