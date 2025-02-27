'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ApiUser {
  id: number;
  username: string;
  maxSessionCount?: number;
  // other user fields from API that might be needed
}

type User = {
  userId: number;
  username: string;
  maxSessionCount: number;
};

export default function UserSessionLimits() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionLimit, setSessionLimit] = useState<number>(5);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success'|'error', message: string} | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/users');
        setUsers(response.data.data.map((user: ApiUser) => ({
          userId: user.id,
          username: user.username,
          maxSessionCount: user.maxSessionCount || 5 // Fallback if not set
        })) || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setSessionLimit(user.maxSessionCount);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdatingUser(selectedUser.userId);
      const response = await api.patch(`/users/${selectedUser.userId}/session-limit`, {
        maxSessionCount: sessionLimit
      });
      
      // Update user in list
      setUsers(users.map(u => 
        u.userId === selectedUser.userId 
          ? { ...u, maxSessionCount: sessionLimit } 
          : u
      ));
      
      setUpdateMessage({
        type: 'success',
        message: `Updated session limit for ${selectedUser.username} to ${sessionLimit === 0 ? 'unlimited' : sessionLimit}`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
      
      // Reset selection
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating session limit:', err);
      setUpdateMessage({
        type: 'error',
        message: 'Failed to update session limit'
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleCancel = () => {
    setSelectedUser(null);
  };

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white">User Session Limits</h2>
      
      {updateMessage && (
        <div className={`mb-4 p-3 rounded ${updateMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {updateMessage.message}
        </div>
      )}
      
      {selectedUser ? (
        <div className="bg-background p-4 rounded-md mb-4">
          <h3 className="text-lg font-semibold mb-2 text-white">Edit Session Limit for {selectedUser.username}</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Maximum Sessions (0 for unlimited)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={sessionLimit}
                onChange={(e) => setSessionLimit(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md text-gray-900"
              />
              <div className="text-sm text-gray-400">
                {sessionLimit === 0 ? 
                  '(Unlimited Sessions)' : 
                  sessionLimit === 1 ? 
                    '(Single Session Only)' : 
                    `(${sessionLimit} Sessions Max)`
                }
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={updatingUser === selectedUser.userId}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              {updatingUser === selectedUser.userId ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Session Limit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {users.map(user => (
                <tr key={user.userId} className="hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.maxSessionCount === 0 ? 'Unlimited' : user.maxSessionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-primary hover:text-primary-focus ml-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 