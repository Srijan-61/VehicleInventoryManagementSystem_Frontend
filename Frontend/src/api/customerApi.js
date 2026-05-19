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
  // Fetch all vehicles registered under the logged-in customer's account.
  // Used to populate the vehicle dropdown in the appointment form.
  getVehicles: () => apiClient.get('/customer/vehicles'),

  // ── Appointments ─────────────────────────────────────────────────────────
  // Get the full appointment history for the logged-in customer.
  getAppointments: () => apiClient.get('/customer/appointments'),

  // Book a new appointment. Payload must include vehicle_ID, service_Type,
  // appointment_Date (ISO string), and optionally problem_Description and notes.
  bookAppointment: (data) => apiClient.post('/customer/appointments', data),

  // Cancel a single Pending appointment by its ID.
  // The backend will reject this request if the appointment is already confirmed or completed.
  cancelAppointment: (id) => apiClient.put(`/customer/appointments/${id}/cancel`),

  // ── Part requests ─────────────────────────────────────────────────────────
  // Get all part requests submitted by the logged-in customer.
  getPartRequests: () => apiClient.get('/customer/part-requests'),

  // Submit a new part request. Payload: part_Name, brand, category,
  // quantity (number), reason, urgency ('Low' | 'Medium' | 'High').
  createPartRequest: (data) => apiClient.post('/customer/part-requests', data),

  // ── Reviews ───────────────────────────────────────────────────────────────
  // Get only the appointments with status === 'Completed'.
  // Used to populate the review dropdown — not all appointments can be reviewed.
  getCompletedAppointments: () => apiClient.get('/customer/appointments/completed'),

  // Get all reviews already left by the logged-in customer.
  // Combined with getCompletedAppointments to filter out already-reviewed appointments.
  getReviews: () => apiClient.get('/customer/reviews'),

  // Submit a review for a completed appointment.
  // Payload: appointment_ID (number), rating (1–5), comment (optional string).
  // Backend will reject duplicate reviews for the same appointment.
  submitReview: (data) => apiClient.post('/customer/reviews', data),
};

