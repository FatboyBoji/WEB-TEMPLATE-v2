'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  lastLogin: string | null;
  maxSessionCount: number;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<{userId: number, count: number} | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/admin/users');
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
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

  const handleSessionLimitUpdate = async (userId: number, newLimit: number) => {
    try {
      await api.patch(`/users/${userId}/session-limit`, {
        maxSessionCount: newLimit
      });
      
      // Update the user in the list with the new limit
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, maxSessionCount: newLimit } : u
        )
      );
      
      // Close the edit mode
      setEditingSession(null);
    } catch (err) {
      console.error('Failed to update session limit:', err);
      setError('Failed to update session limit');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Session Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-700 divide-y divide-gray-600">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-600">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {editingSession && editingSession.userId === user.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={editingSession.count}
                        onChange={(e) => setEditingSession({
                          userId: user.id,
                          count: parseInt(e.target.value) || 0
                        })}
                        className="w-16 px-2 py-1 text-gray-900 rounded"
                      />
                      <button
                        onClick={() => handleSessionLimitUpdate(user.id, editingSession.count)}
                        className="text-green-500 hover:text-green-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSession(null)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>
                        {user.maxSessionCount === 0 ? 'Unlimited' : user.maxSessionCount}
                      </span>
                      <button
                        onClick={() => setEditingSession({userId: user.id, count: user.maxSessionCount})}
                        className="text-blue-500 hover:text-blue-400 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTerminateSession(user.id)}
                      className={`px-3 py-1.5 rounded-md ${
                        user.isActive 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!user.isActive}
                    >
                      {user.isActive ? 'Terminate Session' : 'No Active Session'}
                    </button>
                    <button
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      className={`px-3 py-1.5 rounded-md ${
                        user.isBlocked 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 