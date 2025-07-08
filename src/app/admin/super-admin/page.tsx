'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { UserForm, type UserFormValues } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { type User, type UserRole } from '@/lib/types';

const initialUsers: User[] = [
  { id: 'superadmin-main', username: 'superadmin', role: 'super_admin' },
  { id: '2', username: 'operator_prod', role: 'operator' },
  { id: '3', username: 'andi_mekanik', role: 'mekanik' },
];

export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
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
          } 
        : u
      ));
    } else {
      // Add new user
      const newUser: User = { 
        id: new Date().toISOString(),
        username: data.username,
        role: data.role as UserRole
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
