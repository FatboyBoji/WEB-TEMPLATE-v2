import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { useRouter } from 'next/navigation';

// Types
interface User {
  userId: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for cookies
});

// Interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip refresh token for auth endpoints to prevent loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/verify-session');
    
    // If error is 401 and we haven't already tried to refresh and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        // Don't try to refresh here - redirect instead
        window.location.href = '/auth/login?session=expired';
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const checkSessionCancelSource = useRef<CancelTokenSource | null>(null);
  const renewSessionCancelSource = useRef<CancelTokenSource | null>(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const { data } = await api.get('/auth/me');
          
          if (data.success) {
            setUser(data.data);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add more logging for debugging
      console.log('Attempting login with:', { username });
      
      const { data } = await api.post('/auth/login', { username, password });
      
      console.log('Login response:', data);
      
      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Set user from response data
        setUser(data.data.user);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.tokens.accessToken}`;
        
        // Navigate to dashboard
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Type guard for error object
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      
      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Set user from response data
        setUser(data.data.user);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.tokens.accessToken}`;
        
        // Navigate to dashboard
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      // Type guard for error object
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Get the refresh token from local storage
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Send the refresh token with the logout request
        await api.post('/auth/logout', { refreshToken });
      }
      
      // Clear tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUser(null);
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add these new functions to check and renew session
  const checkSession = async (refreshToken: string): Promise<boolean> => {
    try {
      // Cancel any previous request
      if (checkSessionCancelSource.current) {
        checkSessionCancelSource.current.cancel('Operation canceled due to new request.');
      }

      // Create a new cancel token
      checkSessionCancelSource.current = axios.CancelToken.source();
      
      console.log('Checking session validity');
      const response = await api.post('/auth/check-session', 
        { refreshToken }, 
        { cancelToken: checkSessionCancelSource.current.token }
      );
      return response.data.success;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Session check failed:', error);
      }
      return false;
    }
  };

  const renewSession = async (refreshToken: string): Promise<boolean> => {
    try {
      // Cancel any previous request
      if (renewSessionCancelSource.current) {
        renewSessionCancelSource.current.cancel('Operation canceled due to new request.');
      }

      // Create a new cancel token
      renewSessionCancelSource.current = axios.CancelToken.source();
      
      console.log('Renewing session');
      const response = await api.post('/auth/renew-session', 
        { refreshToken }, 
        { cancelToken: renewSessionCancelSource.current.token }
      );
      
      if (response.data.success) {
        // Update tokens
        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;
        
        console.log('Session renewed successfully, received new tokens');
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Session renewal failed:', error);
      }
      return false;
    }
  };

  // Replace the current verifySession with this modular approach
  const verifySession = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting session verification process');
      
      // Get refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.error('No refresh token available');
        await logout();
        return false;
      }
      
      // First just check if session is valid
      const isValid = await checkSession(refreshToken);
      
      if (!isValid) {
        console.log('Session invalid, logging out');
        // Use the existing logout function that we know works
        await logout();
        return false;
      }
      
      // If valid, renew the session
      const renewed = await renewSession(refreshToken);
      
      if (!renewed) {
        console.log('Session renewal failed, logging out');
        await logout();
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Session verification error:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifySession,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 