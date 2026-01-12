import axios from './axios';

// Billing APIs
export const billingApi = {
  getStats: (period) => axios.get('/billing/stats', { params: { period } }),
  getInvoices: (params) => axios.get('/billing/invoices', { params }),
  getInvoiceById: (id) => axios.get(`/billing/invoices/${id}`),
  createInvoice: (data) => axios.post('/billing/invoices', data),
  updateInvoice: (id, data) => axios.patch(`/billing/invoices/${id}`, data),
  sendInvoiceEmail: (id) => axios.post(`/billing/invoices/${id}/send-email`),
  sendManualReminder: (id, data) => axios.post(`/billing/invoices/${id}/remind`, data),
  exportInvoicePDF: (id) => axios.get(`/billing/invoices/${id}/pdf`, { responseType: 'blob' }),
  recordPayment: (data) => axios.post('/billing/payments', data),
  getPayments: (params) => axios.get('/billing/payments', { params }),
  getPaymentHistory: (invoiceId) => axios.get(`/billing/payments/invoice/${invoiceId}`),
  createReminder: (data) => axios.post('/billing/reminders', data),
  getReminders: () => axios.get('/billing/reminders'),
  updateReminder: (id, data) => axios.patch(`/billing/reminders/${id}`, data),
  deleteReminder: (id) => axios.delete(`/billing/reminders/${id}`),
  createReceipt: (data) => axios.post('/billing/receipts', data),
  getHistory: () => axios.get('/billing/history'),
};