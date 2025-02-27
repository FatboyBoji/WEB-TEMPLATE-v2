import axios from 'axios';

// Create a base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55500/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Try to refresh the token or redirect to login
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55500/api'}/auth/refresh`,
            { refreshToken }
          );
          
          // If successful, update the tokens
          if (refreshResponse.data.success) {
            localStorage.setItem('accessToken', refreshResponse.data.data.accessToken);
            
            // Retry the original request with the new token
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 