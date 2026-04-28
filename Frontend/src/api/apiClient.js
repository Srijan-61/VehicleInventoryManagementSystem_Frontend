import axios from 'axios';

// Axios instance with baseURL '/api'.
// The Vite proxy maps /api → https://localhost:7259 (parts/sales backend)
// and /api/Auth, /api/Admin → https://localhost:7111 (auth backend).
// This means all requests stay on the same origin, avoiding CORS and
// the self-signed certificate error entirely.
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT bearer token to every request when present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Extract a human-readable error message from an Axios error
const extractError = (err) => {
  const data = err.response?.data;
  return data?.message || data?.Message || data?.title || err.message || 'Request failed';
};

export async function apiGet(path) {
  try {
    const res = await apiClient.get(path);
    return res.data;
  } catch (err) { throw new Error(extractError(err)); }
}

export async function apiPost(path, body) {
  try {
    const res = await apiClient.post(path, body);
    return res.data ?? null;
  } catch (err) { throw new Error(extractError(err)); }
}

export async function apiPut(path, body) {
  try {
    const res = await apiClient.put(path, body);
    return res.data ?? null;
  } catch (err) { throw new Error(extractError(err)); }
}

export async function apiDelete(path) {
  try {
    const res = await apiClient.delete(path);
    return res.data ?? null;
  } catch (err) { throw new Error(extractError(err)); }
}

export default apiClient;

