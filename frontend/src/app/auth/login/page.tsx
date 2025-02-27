'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, verifySession } = useAuth();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<{type: 'error'|'info'|'success', message: string}|null>(null);
  const [attemptedVerification, setAttemptedVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  useEffect(() => {
    const sessionExpired = searchParams.get('session') === 'expired';
    
    // Show a message immediately when redirected due to session expiry
    if (sessionExpired && !attemptedVerification) {
      setStatusMessage({
        type: 'info',
        message: 'Your session has expired. Please log in again to continue.'
      });
      
      setAttemptedVerification(true);
      
      // We don't need to attempt verification anymore - we've already been redirected
      // due to session expiry, so just ask the user to log in again
      console.log('Session expired, user needs to log in again');
    }
  }, [searchParams, attemptedVerification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full space-y-10 p-12 bg-secondary rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">WealthArc</h2>
          <p className="mt-3 text-xl text-gray-300">Sign in to your account</p>
        </div>
        
        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-md">
              {error}
            </div>
          )}
          
          {statusMessage && (
            <div className={`${
              statusMessage.type === 'error' ? 'bg-red-500' : 
              statusMessage.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
            } text-white p-3 rounded-md`}>
              {statusMessage.message}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 text-base"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 text-base"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-base text-gray-300">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
} 