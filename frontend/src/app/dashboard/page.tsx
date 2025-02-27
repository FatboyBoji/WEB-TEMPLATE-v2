'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#09BC8A] mb-2">
          Welcome, {user?.username}!
        </h1>
        <p className="text-gray-300">
          Here's a summary of your financial status.
        </p>
      </div>
      
      {/* Summary Card */}
      <div className="bg-[#212121] rounded-lg p-5 mb-6">
        <h2 className="text-xl font-semibold mb-3">Monthly Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Income</span>
            <span className="text-[#09BC8A] font-bold">€2,700</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Expenses</span>
            <span className="text-red-400 font-bold">€1,930</span>
          </div>
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between">
              <span>Remaining Budget</span>
              <span className="font-bold">€770</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button className="bg-[#004346] p-4 rounded-lg text-center">
          <span className="block text-xl mb-1">💰</span>
          <span>Add Income</span>
        </button>
        <button className="bg-[#004346] p-4 rounded-lg text-center">
          <span className="block text-xl mb-1">💸</span>
          <span>Add Expense</span>
        </button>
      </div>
      
      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
      <div className="space-y-2">
        <div className="bg-[#212121] p-3 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">Cinema</h3>
            <p className="text-sm text-gray-400">Variable expense</p>
          </div>
          <span className="text-red-400">-€30</span>
        </div>
        <div className="bg-[#212121] p-3 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">Helping a friend</h3>
            <p className="text-sm text-gray-400">Variable income</p>
          </div>
          <span className="text-[#09BC8A]">+€200</span>
        </div>
        <div className="bg-[#212121] p-3 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">Monthly Expenses</h3>
            <p className="text-sm text-gray-400">Fixed expense</p>
          </div>
          <span className="text-red-400">-€1,900</span>
        </div>
      </div>
    </ProtectedLayout>
  );
} 