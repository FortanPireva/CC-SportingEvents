import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors - clear auth data on 401 but don't force redirect to avoid loops
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('cc_auth_token');
      localStorage.removeItem('cc_user');
      
      // Only redirect if not already on auth pages to avoid loops
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/signin', '/signup', '/register', '/reset-password', '/forgot-password'];
      const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
      
      if (!isOnAuthPage) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

