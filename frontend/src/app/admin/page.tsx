'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  lastLogin: string | null;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users on component mount
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/admin/users');
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, router]);
  
  const handleTerminateSession = async (userId: number) => {
    try {
      const { data } = await api.post(`/auth/terminate-sessions/${userId}`);
      if (data.success) {
        // Update the user's status in the list
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isActive: false } : u
          )
        );
      }
    } catch (err) {
      setError('Failed to terminate session');
      console.error(err);
    }
  };
  
  const handleToggleBlock = async (userId: number, currentBlockStatus: boolean) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}`, {
        isBlocked: !currentBlockStatus
      });
      
      if (data.success) {
        // Update the user in the list
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isBlocked: !currentBlockStatus } : u
          )
        );
      }
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };
  
  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-[#09BC8A]">Admin Dashboard</h1>
        <p className="text-gray-300">Manage users and sessions</p>
      </div>
      
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#09BC8A]"></div>
        </div>
      ) : (
        <div className="bg-[#212121] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#004346]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#2D2D2D] divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.username}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isBlocked 
                          ? 'bg-red-800 text-red-100' 
                          : user.isActive 
                            ? 'bg-green-800 text-green-100' 
                            : 'bg-gray-800 text-gray-100'
                      }`}>
                        {user.isBlocked ? 'Blocked' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleTerminateSession(user.id)}
                        className="text-red-400 hover:text-red-300 mr-4"
                        disabled={!user.isActive}
                      >
                        Terminate Session
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                        className={user.isBlocked ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}
                      >
                        {user.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
} 