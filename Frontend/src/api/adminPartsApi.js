import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

// GET /api/admin/parts — fetch full parts list
export const getAllParts = () => apiGet('/admin/parts');

// POST /api/admin/parts/purchase — submit a purchase order
export const purchaseParts = (payload) => apiPost('/admin/parts/purchase', payload);

// PUT /api/admin/parts/{partId} — update an existing part
export const updatePart = (partId, payload) => apiPut(`/admin/parts/${partId}`, payload);

// DELETE /api/admin/parts/{partId} — remove a part
export const deletePart = (partId) => apiDelete(`/admin/parts/${partId}`);
