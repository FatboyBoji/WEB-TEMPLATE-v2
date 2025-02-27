'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-300">Manage your account settings</p>
      </div>
      
      {/* User Info */}
      <div className="bg-[#212121] rounded-lg p-5 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#004346] flex items-center justify-center text-2xl mr-4">
            {user?.username?.substring(0, 1)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.username}</h2>
            <p className="text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div className="bg-[#212121] rounded-lg overflow-hidden mb-6">
        <div className="p-3 border-b border-gray-700">
          <h2 className="font-medium">Account Settings</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">✉️</span>
            <span>Change Email</span>
          </button>
          
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">🔒</span>
            <span>Change Password</span>
          </button>
          
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">🔔</span>
            <span>Notifications</span>
          </button>
          
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">🌙</span>
            <span>Dark Mode</span>
          </button>
        </div>
      </div>
      
      {/* About */}
      <div className="bg-[#212121] rounded-lg overflow-hidden mb-8">
        <div className="p-3 border-b border-gray-700">
          <h2 className="font-medium">About</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">📘</span>
            <span>Terms of Service</span>
          </button>
          
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">🔒</span>
            <span>Privacy Policy</span>
          </button>
          
          <button className="w-full p-4 text-left flex items-center">
            <span className="mr-3">ℹ️</span>
            <span>About Wealth Arc</span>
          </button>
        </div>
      </div>
      
      {/* Logout Button */}
      <button 
        onClick={logout} 
        className="w-full bg-red-500 text-white rounded-lg py-3 font-bold hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
      
      {/* Admin Dashboard Button */}
      {user?.role === 'admin' && (
        <button 
          onClick={() => router.push('/admin')} 
          className="w-full bg-[#004346] text-white rounded-lg py-3 font-bold hover:bg-[#00595d] transition-colors mb-4"
        >
          Admin Dashboard
        </button>
      )}
    </ProtectedLayout>
  );
} 