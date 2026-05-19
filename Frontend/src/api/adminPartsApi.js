import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// All functions here use apiClient.js which automatically:
//   - attaches the JWT token from localStorage as an Authorization header
//   - sets Content-Type to application/json
//   - extracts a readable error message from any failed response

// Fetch the full list of all parts currently in the inventory
export const getAllParts = () => apiGet('/admin/parts');

// Submit a purchase order to the backend.
// If the part already exists (part_ID is a number), the backend increases its stock_Quantity.
// If it is a new part (part_ID is null), the backend creates a new part record first.
export const purchaseParts = (payload) => apiPost('/admin/parts/purchase', payload);

// Update the details of an existing part — name, brand, category, price, stock, reorder level
export const updatePart = (partId, payload) => apiPut(`/admin/parts/${partId}`, payload);

// Permanently remove a part from the inventory by its ID
export const deletePart = (partId) => apiDelete(`/admin/parts/${partId}`);

// Fetch the list of vendors — used to fill the vendor dropdown in the purchase form
export const getVendors = () => apiGet('/admin/vendors');
