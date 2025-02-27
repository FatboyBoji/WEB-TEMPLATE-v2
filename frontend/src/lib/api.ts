import axios from 'axios';

// Create a base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ignore aborted requests during navigation
    if (error.code === 'ECONNABORTED' || axios.isCancel(error)) {
      console.log('Request aborted or canceled, likely due to navigation');
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Handle both 401 and 403 for token issues
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check the error message to see if it's related to token expiration
      const isTokenError = error.response?.data?.message?.includes('token') || 
                          error.response?.data?.message?.includes('expired') ||
                          error.response?.data?.message?.includes('invalid');
      
      // Only handle token-related errors
      if (isTokenError) {
        try {
          // This is a token error, clear tokens and redirect to login
          console.log('Token expired, clearing tokens and redirecting to login');
          
          // Clear tokens to ensure we don't attempt to use them again
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Redirect to login page with expired session parameter
          window.location.href = '/auth/login?session=expired';
          return Promise.reject(error);
        } catch (refreshError) {
          console.error('Error during session expiry handling:', refreshError);
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // For non-token related 401/403 errors, just reject
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 