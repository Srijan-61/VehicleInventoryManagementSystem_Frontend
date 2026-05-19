import axios from 'axios';

// Axios instance used by staffApi.js for all staff and auth-related API calls.
// It connects directly to the backend using VITE_API_URL (or falls back to localhost:7111).
// Every request automatically gets the JWT bearer token, and any 401 response
// (expired or invalid token) automatically logs the user out and redirects to login.

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7111/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the stored JWT token to every outgoing request as a Bearer header.
// If no token exists (user is logged out), the header is simply not added.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically log out and redirect to login when the server rejects the token.
// A 401 Unauthorized response means the JWT has expired or is invalid.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
