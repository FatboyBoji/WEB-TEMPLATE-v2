'use client';

import React from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function StatisticsPage() {
  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Financial Statistics</h1>
        <p className="text-gray-300">Track your financial progress over time</p>
      </div>
      
      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <button className="bg-[#004346] px-4 py-2 rounded-lg">Month</button>
        <button className="px-4 py-2">Quarter</button>
        <button className="px-4 py-2">Year</button>
      </div>
      
      {/* Placeholder for Charts */}
      <div className="mb-6 bg-[#212121] p-5 rounded-lg text-center">
        <div className="mb-4 flex justify-between">
          <h2 className="font-medium">Income vs. Expenses</h2>
          <span>📊</span>
        </div>
        <div className="h-48 flex items-center justify-center border border-dashed border-gray-600 rounded">
          <p className="text-gray-400">Income/Expense Chart will appear here</p>
        </div>
      </div>
      
      <div className="mb-6 bg-[#212121] p-5 rounded-lg text-center">
        <div className="mb-4 flex justify-between">
          <h2 className="font-medium">Expense Categories</h2>
          <span>🍩</span>
        </div>
        <div className="h-48 flex items-center justify-center border border-dashed border-gray-600 rounded">
          <p className="text-gray-400">Expense Category Chart will appear here</p>
        </div>
      </div>
      
      {/* Monthly Summary */}
      <div className="bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700">
          <h2 className="font-medium">Monthly Summary</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-2">Month</th>
                <th className="pb-2">Income</th>
                <th className="pb-2">Expenses</th>
                <th className="pb-2">Savings</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2">Nov</td>
                <td className="py-2 text-[#09BC8A]">€2,700</td>
                <td className="py-2 text-red-400">€1,930</td>
                <td className="py-2">€770</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2">Oct</td>
                <td className="py-2 text-[#09BC8A]">€2,500</td>
                <td className="py-2 text-red-400">€1,800</td>
                <td className="py-2">€700</td>
              </tr>
              <tr>
                <td className="py-2">Sep</td>
                <td className="py-2 text-[#09BC8A]">€2,800</td>
                <td className="py-2 text-red-400">€2,200</td>
                <td className="py-2">€600</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  );
} 