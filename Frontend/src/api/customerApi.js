import apiClient from './axiosConfig';

// All requests here automatically include the JWT bearer token.
// The token is attached by the request interceptor in axiosConfig.js.
// A 401 response (expired/invalid token) will auto-redirect to /login.
export const customerApi = {
  // ── Existing profile / history methods ──────────────────────────────────
  getProfile:          ()     => apiClient.get('/customer/profile'),
  updateProfile:       (data) => apiClient.put('/customer/profile', data),
  getHistory:          ()     => apiClient.get('/customer/history'),
  selfServiceRequest:  (data) => apiClient.post('/customer/self-service', data),

  // ── Vehicles ─────────────────────────────────────────────────────────────
  getVehicles: () => apiClient.get('/customer/vehicles'),

  // ── Appointments ─────────────────────────────────────────────────────────
  getAppointments: () => apiClient.get('/customer/appointments'),
  bookAppointment: (data) => apiClient.post('/customer/appointments', data),
  cancelAppointment: (id) => apiClient.put(`/customer/appointments/${id}/cancel`),

  // ── Part requests ─────────────────────────────────────────────────────────
  getPartRequests: () => apiClient.get('/customer/part-requests'),
  createPartRequest: (data) => apiClient.post('/customer/part-requests', data),

  // Delete a part request by ID. Only allowed while the request is still Pending.
  deletePartRequest:  (id) => apiClient.delete(`/customer/part-requests/${id}`),
  // Fallback cancel (PUT) in case the backend doesn't expose DELETE.
  cancelPartRequest:  (id) => apiClient.put(`/customer/part-requests/${id}/cancel`),

  // ── Reviews ───────────────────────────────────────────────────────────────
  getCompletedAppointments: () => apiClient.get('/customer/appointments/completed'),
  getReviews: () => apiClient.get('/customer/reviews'),
  submitReview: (data) => apiClient.post('/customer/reviews', data),

  // F12: Customer Registration
  register: (userData) => apiClient.post('/CustomerSelfRegister/register', userData),
  customerLogin: (credentials) => apiClient.post('/CustomerSelfRegister/login', credentials),
  addVehicle: (vehicleData) => apiClient.post('/CustomerAuth/vehicle', vehicleData),
  getMyVehicles: () => apiClient.get('/CustomerAuth/vehicles'),
  updateMyProfile: (profileData) => apiClient.put('/CustomerAuth/profile', profileData),
};