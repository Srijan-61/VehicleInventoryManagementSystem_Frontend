import { apiPost } from './apiClient';

// POST /api/sales/create-invoice — create a sales invoice and receive loyalty discount result
export const createInvoice = (payload) => apiPost('/sales/create-invoice', payload);
