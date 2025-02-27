'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/lib/api';
import UserManagement from '@/components/admin/UserManagement';
import UserSessionLimits from '@/components/admin/UserSessionLimits';
import SystemSettings from '@/components/admin/SystemSettings';

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
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false); // Local loading state
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Fetch users on component mount
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setLoading(true); // Use our local loading state
        const { data } = await api.get('/admin/users');
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false); // Use our local loading state
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
  
  if (authLoading || loading) { // Check both loading states
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="mb-6">
          <div className="border-b border-gray-700 flex">
            <button
              className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'sessions' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
              onClick={() => setActiveTab('sessions')}
            >
              Session Limits
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
              onClick={() => setActiveTab('settings')}
            >
              System Settings
            </button>
          </div>
        </div>
        
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'sessions' && <UserSessionLimits />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </ProtectedLayout>
  );
} 