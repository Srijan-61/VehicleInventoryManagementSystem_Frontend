import apiClient from './axiosConfig';

export const adminApi = {
  getFinancialReports: () => apiClient.get('/admin/financial-reports'),
  manageStaff: (data) => apiClient.post('/admin/staff', data),
  getParts: () => apiClient.get('/admin/parts'),
  getInvoices: () => apiClient.get('/admin/invoices'),
  getVendors: () => apiClient.get('/admin/vendors'),
};
