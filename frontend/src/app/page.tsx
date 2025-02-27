'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-[#192A38] text-white flex flex-col">
      {/* Hero Section */}
      <header className="w-full py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#09BC8A]">
            Take Control of Your Finances
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Simple, effective budgeting for a more secure financial future
          </p>
          <button 
            onClick={() => router.push('/auth/login')} 
            className="bg-[#09BC8A] text-[#192A38] font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-12 px-4 bg-[#004346]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Wealth Arc?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#212121] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#09BC8A]">Track Your Spending</h3>
              <p>Monitor all your income and expenses in one place with an intuitive interface.</p>
            </div>
            
            <div className="bg-[#212121] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#09BC8A]">Set Budgets</h3>
              <p>Create monthly budgets and get alerts when you're approaching your limits.</p>
            </div>
            
            <div className="bg-[#212121] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-[#09BC8A]">Visual Reports</h3>
              <p>See where your money goes with beautiful charts and detailed statistics.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to gain financial clarity?</h2>
          <p className="text-xl mb-8">Join thousands of users who have improved their financial habits with Wealth Arc.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" className="bg-[#09BC8A] text-[#192A38] font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-90 transition-all">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-transparent border-2 border-[#09BC8A] text-[#09BC8A] font-bold py-3 px-6 rounded-lg text-lg hover:bg-[#09BC8A] hover:text-[#192A38] transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-[#004346] mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2025 Wealth Arc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}