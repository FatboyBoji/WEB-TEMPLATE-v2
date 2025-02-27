'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function SessionHandler() {
  const { verifySession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isRefreshingRef = useRef(false);
  
  useEffect(() => {
    // Only run session checks on authenticated routes, not auth pages
    if (!pathname.startsWith('/auth')) {
      // Check for token expiration proactively
      const checkTokenExpiration = async () => {
        // Prevent multiple concurrent verification attempts
        if (isRefreshingRef.current) return;
        
        // Get access token
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          try {
            // Decode token to check expiration
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join('')
            );
            const decoded = JSON.parse(jsonPayload);
            
            // If token will expire in next 2 minutes, try to renew proactively
            const expiryTime = decoded.exp * 1000; // convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;
            
            // If token will expire in the next 2 minutes, renew it
            if (timeUntilExpiry > 0 && timeUntilExpiry < 120000) {
              console.log('Token expiring soon, attempting proactive renewal');
              
              // Mark as refreshing to prevent concurrent attempts
              isRefreshingRef.current = true;
              
              try {
                const success = await verifySession();
                
                if (!success) {
                  console.log('Session renewal failed, navigating to login');
                  // Use router.push instead of window.location for cleaner navigation
                  router.push('/auth/login?session=expired');
                } else {
                  console.log('Session renewed proactively');
                }
              } finally {
                // Always reset the refreshing flag when done
                isRefreshingRef.current = false;
              }
            }
          } catch (error) {
            console.error('Error checking token expiration:', error);
            isRefreshingRef.current = false;
          }
        }
      };
      
      // Check immediately but with a small delay to prevent immediate issues
      const initialCheckTimeout = setTimeout(checkTokenExpiration, 5000);
      
      // Use a longer interval to reduce frequency of checks (60 seconds)
      const interval = setInterval(checkTokenExpiration, 60000);
      
      return () => {
        clearTimeout(initialCheckTimeout);
        clearInterval(interval);
      };
    }
  }, [pathname, verifySession, router]);
  
  return null; // This component doesn't render anything
} 