import apiClient from './axiosConfig';

// All functions here use axiosConfig.js which automatically:
//   - attaches the JWT token from localStorage as an Authorization header
//   - sets Content-Type to application/json
//   - redirects to /login on 401

// Fetch the full list of all parts currently in the inventory
export const getAllParts = () => apiClient.get('/admin/parts');

// Submit a purchase order to the backend.
// If the part already exists (part_ID is a number), the backend increases its stock_Quantity.
// If it is a new part (part_ID is null), the backend creates a new part record first.
export const purchaseParts = (payload) => apiClient.post('/admin/parts/purchase', payload);

// Update the details of an existing part — name, brand, category, price, stock, reorder level
export const updatePart = (partId, payload) => apiClient.put(`/admin/parts/${partId}`, payload);

// Permanently remove a part from the inventory by its ID
export const deletePart = (partId) => apiClient.delete(`/admin/parts/${partId}`);

// Fetch the list of vendors — used to fill the vendor dropdown in the purchase form
export const getVendors = () => apiClient.get('/admin/vendors');

// Purchase a brand-new part (does not exist yet) and record the first purchase invoice.
// Endpoint: POST /admin/parts/purchase-new
export const purchaseNewPart = (payload) => apiClient.post('/admin/parts/purchase-new', payload);
