import { apiPost } from './apiClient';

// POST /api/customer/appointments — book a service appointment
export const bookAppointment = (payload) => apiPost('/customer/appointments', payload);

// POST /api/customer/part-requests — request a part not currently in stock
export const requestPart = (payload) => apiPost('/customer/part-requests', payload);

// POST /api/customer/reviews — submit a review for a completed service
export const submitReview = (payload) => apiPost('/customer/reviews', payload);
