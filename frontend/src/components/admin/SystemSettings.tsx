'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function SystemSettings() {
  const [defaultSessionLimit, setDefaultSessionLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/settings');
        if (response.data.success) {
          setDefaultSessionLimit(response.data.data.defaultSessionLimit || 5);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await api.post('/admin/settings', {
        defaultSessionLimit
      });
      
      if (response.data.success) {
        setSuccessMessage('Default session limit updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white">System Settings</h2>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-600 text-white">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-600 text-white">
          {successMessage}
        </div>
      )}

      <div className="bg-background p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Session Management</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Default Session Limit for New Users
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={defaultSessionLimit}
              onChange={(e) => setDefaultSessionLimit(parseInt(e.target.value) || 0)}
              className="w-40 px-3 py-2 border rounded-md text-gray-900"
            />
            <div className="text-sm text-gray-400">
              {defaultSessionLimit === 0 ? 
                '(Unlimited Sessions)' : 
                defaultSessionLimit === 1 ? 
                  '(Single Session Only)' : 
                  `(${defaultSessionLimit} Sessions Max)`
              }
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            This is the default number of simultaneous sessions allowed for newly registered users.
            Set to 0 for unlimited sessions.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
} 