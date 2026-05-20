import apiClient from './axiosConfig';

export const adminApi = {
  getFinancialReports: () => apiClient.get('/admin/financial-reports'),
  manageStaff: (data) => apiClient.post('/admin/staff', data),
  getParts: () => apiClient.get('/admin/parts'),
  getInvoices: () => apiClient.get('/admin/invoices'),
  getVendors: () => apiClient.get('/admin/vendors'),

  // F1 – Financial Reports
  getDailyReport: async (date) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5251/api/FinancialReport/daily?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  getMonthlyReport: async (year, month) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5251/api/FinancialReport/monthly?year=${year}&month=${month}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  getYearlyReport: async (year) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5251/api/FinancialReport/yearly?year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // F4 – Purchase Invoices
  createPurchaseInvoice: (payload) => apiClient.post('/AdminPurchaseInvoice/create', payload),
  getPurchaseInvoices: () => apiClient.get('/AdminPurchaseInvoice/all'),
  getAllParts: () => apiClient.get('/admin/parts'),
  getVendorsForPurchase: () => apiClient.get('/admin/vendors'),

  // F15 – Stock Alerts & Overdue Credits (corrected)
  getLowStockAlerts: () => apiClient.get('/Notifications/low-stock'),
  getOverdueCustomers: () => apiClient.get('/Notifications/overdue-credits?daysOverdue=30'),
  sendCreditReminders: () => apiClient.post('/Notifications/send-all-reminders'),
};