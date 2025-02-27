'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const MobileNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Wallet', path: '/wallet', icon: '💰' },
    { name: 'Statistics', path: '/statistics', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];
  
  // Add admin route for admin users
  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: '⚙️' });
  }
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="bg-[#004346] p-4 flex items-center justify-between">
        <span className="text-xl font-bold text-white">WealthArc</span>
        <button 
          className="text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#004346] z-50 pt-16">
          <div className="p-4">
            <nav>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                        isActive(item.path) ? 'bg-[#09BC8A] text-white' : 'text-gray-300'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* User Info */}
            <div className="mt-8 border-t border-[#015d5f] pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#09BC8A] flex items-center justify-center">
                  {user?.username?.substring(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-white font-medium">{user?.username}</div>
                  <div className="text-gray-400 text-sm">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar; 