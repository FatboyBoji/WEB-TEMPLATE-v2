'use client';

import React, { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

type BudgetItemType = 'income' | 'expense';
type BudgetCategory = 'fixed' | 'variable';

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  type: BudgetItemType;
  category: BudgetCategory;
}

export default function WalletPage() {
  const [currentMonth, setCurrentMonth] = useState('NOVEMBER 2024');
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', name: 'Income', amount: 2500, type: 'income', category: 'fixed' },
    { id: '2', name: 'Helping a friend', amount: 200, type: 'income', category: 'variable' },
    { id: '3', name: 'Expenses', amount: 1900, type: 'expense', category: 'fixed' },
    { id: '4', name: 'Cinema', amount: 30, type: 'expense', category: 'variable' },
  ]);
  
  // Calculate summary data
  const totalIncome = items
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const totalExpenses = items
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const remainingBudget = totalIncome - totalExpenses;
  
  // Filter items by type and category
  const fixedIncome = items.filter(item => item.type === 'income' && item.category === 'fixed');
  const variableIncome = items.filter(item => item.type === 'income' && item.category === 'variable');
  const fixedExpenses = items.filter(item => item.type === 'expense' && item.category === 'fixed');
  const variableExpenses = items.filter(item => item.type === 'expense' && item.category === 'variable');
  
  return (
    <ProtectedLayout>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
        <button className="text-[#09BC8A]">✏️</button>
      </div>
      
      {/* Distribution Summary */}
      <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">Distribution</h2>
          <span>▼</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Income</span>
            <span className="font-bold">{totalIncome}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total expenses</span>
            <span className="font-bold">{totalExpenses}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Remaining Budget</span>
            <span className="font-bold">{remainingBudget}€</span>
          </div>
        </div>
      </div>
      
      {/* Fixed Income */}
      <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">fixed income</h2>
          <span>▼</span>
        </div>
        <div className="p-3 space-y-2">
          {fixedIncome.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <span>{item.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{item.amount}€</span>
                <button>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Variable Income */}
      <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">variable income</h2>
          <span>▼</span>
        </div>
        <div className="p-3 space-y-2">
          {variableIncome.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <span>{item.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{item.amount}€</span>
                <button>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed Expenses */}
      <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">fixed expenses</h2>
          <span>▼</span>
        </div>
        <div className="p-3 space-y-2">
          {fixedExpenses.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <span>{item.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{item.amount}€</span>
                <button>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Variable Expenses */}
      <div className="mb-4 bg-[#212121] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">variable expenses</h2>
          <span>▼</span>
        </div>
        <div className="p-3 space-y-2">
          {variableExpenses.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <span>{item.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{item.amount}€</span>
                <button>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Item Button */}
      <button className="w-full bg-[#09BC8A] text-[#192A38] rounded-lg py-3 font-bold">
        Add item
      </button>
    </ProtectedLayout>
  );
} 