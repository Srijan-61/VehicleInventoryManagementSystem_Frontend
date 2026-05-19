import apiClient from './axiosConfig';

// All requests in this file automatically include the JWT token.
// The token is attached by the request interceptor defined in axiosConfig.js.
export const staffApi = {
  // Register a new customer account from the staff panel
  registerCustomer: (data) => apiClient.post('/staff/register-customer', data),

  // Create a point-of-sale (POS) invoice when a customer pays at the counter
  createPOSInvoice: (data) => apiClient.post('/staff/pos-invoice', data),

  // Search customers by name, phone, or email — used in the customer search bar
  searchCustomer: (query) => apiClient.get(`/staff/customers?search=${query}`),

  // Fetch a summary report of all registered customers — used on the reports page
  getCustomerReports: () => apiClient.get('/staff/customer-reports'),


  // Get the full customer list for the "Select Customer" dropdown
  getCustomers: () => apiClient.get('/staff/customers'),

  // Get only the invoices that belong to a specific customer
  // Used to populate the "Select Invoice" dropdown after a customer is chosen
  getCustomerInvoices: (customerId) =>
    apiClient.get(`/staff/invoices/customer/${customerId}/invoices`),

  // Get all details of a single invoice for the preview card
  // Both customerId and salesInvoiceNo are sent so the backend can verify ownership
  getInvoiceDetails: (customerId, salesInvoiceNo) =>
    apiClient.get(`/staff/invoices/customer/${customerId}/invoice/${salesInvoiceNo}`),

  // Send the invoice as an email to the customer.
  // Always passes BOTH customer_ID and sales_Invoice_No together
  // so the backend can confirm the invoice belongs to the selected customer.
  sendInvoiceEmail: (customerId, salesInvoiceNo) =>
    apiClient.post('/staff/invoices/send-email', {
      customer_ID: Number(customerId),
      sales_Invoice_No: Number(salesInvoiceNo),
    }),

  // ── Customer report endpoints ─────────────────────────────────────────────
  // All three methods accept a pre-built URL (path + query string) so the
  // StaffCustomerReports component controls which params are sent.
  // The base endpoint paths are defined as constants in StaffCustomerReports.jsx
  // so they are easy to update without touching the API layer.

  // Fetch the regular customers report — customers who visit or purchase frequently
  getRegularCustomers: (urlWithParams) =>
    apiClient.get(urlWithParams),

  // Fetch the high spenders report — customers ranked by total spending
  getHighSpenders: (urlWithParams) =>
    apiClient.get(urlWithParams),

  // Fetch the pending credits report — customers with unpaid or overdue balances
  getPendingCredits: (urlWithParams) =>
    apiClient.get(urlWithParams),

  // Generic report fetcher used by StaffCustomerReports to call any report endpoint.
  // Accepts the full path-plus-querystring built by the component.
  fetchReport: (urlWithParams) =>
    apiClient.get(urlWithParams),

  // Fetch recent invoices — added from main branch
  getRecentInvoices: (count = 10) => apiClient.get(`/staff/recent-invoices?count=${count}`),

  // ── Approval endpoints ────────────────────────────────────────────────────
  // Fetch all appointments that are currently in Pending status
  getPendingAppointments: () =>
    apiClient.get('/staff/approvals/appointments/pending'),

  // Move a Pending appointment to Confirmed
  approveAppointment: (appointmentId) =>
    apiClient.put(`/staff/approvals/appointments/${appointmentId}/approve`),

  // Move an appointment to Rejected (cancels it from staff side)
  rejectAppointment: (appointmentId) =>
    apiClient.put(`/staff/approvals/appointments/${appointmentId}/reject`),

  // Mark an appointment as Completed — required before customer can leave a review
  completeAppointment: (appointmentId) =>
    apiClient.put(`/staff/approvals/appointments/${appointmentId}/complete`),

  // Fetch all appointments that are currently in Approved status
  getApprovedAppointments: () =>
    apiClient.get('/staff/approvals/appointments/approved'),

  // Fetch all part requests that are currently in Pending status
  getPendingPartRequests: () =>
    apiClient.get('/staff/approvals/parts/pending'),

  // Approve a customer part request
  approvePartRequest: (requestId) =>
    apiClient.put(`/staff/approvals/parts/${requestId}/approve`),

  // Reject a customer part request
  rejectPartRequest: (requestId) =>
    apiClient.put(`/staff/approvals/parts/${requestId}/reject`),
};
