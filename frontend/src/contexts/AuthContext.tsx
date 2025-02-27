import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
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
                          originalRequest.url?.includes('/auth/refresh');
    
    // If error is 401 and we haven't already tried to refresh and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const { data } = await api.post('/auth/refresh');
        
        // If successful, set the new access token
        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
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
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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