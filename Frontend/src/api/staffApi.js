import apiClient from './axiosConfig';

export const staffApi = {
  registerCustomer: (data) => apiClient.post('/staff/register-customer', data),
  createPOSInvoice: (data) => apiClient.post('/staff/pos-invoice', data),
  searchCustomer: (query) => apiClient.get(`/staff/customers?search=${query}`),
  getCustomerReports: () => apiClient.get('/staff/customer-reports'),
};
