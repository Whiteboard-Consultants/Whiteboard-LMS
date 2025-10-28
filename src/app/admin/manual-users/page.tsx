'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ManualUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function ViewManualUsersPage() {
  const [users, setUsers] = useState<ManualUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
      } else {
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Registration Users</CardTitle>
          <p className="text-sm text-gray-600">
            Users created through manual registration system (bypassing Supabase Auth triggers)
          </p>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(user.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'instructor' ? 'secondary' : 'default'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {user.status === 'pending' && user.role === 'instructor' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'active')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateUserStatus(user.id, 'suspended')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}