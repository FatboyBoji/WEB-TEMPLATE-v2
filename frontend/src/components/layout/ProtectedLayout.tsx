'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MobileNavbar from './MobileNavbar';
import SideNav from './SideNav';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="md:flex">
        {/* Side navigation (hidden on mobile) */}
        <div className="hidden md:block md:w-64 h-screen bg-[#004346] fixed">
          <SideNav />
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout; 