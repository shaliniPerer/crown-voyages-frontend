import axios from './axios';

// Analytics APIs
export const analyticsApi = {
  getBookingReports: (params) => axios.get('/analytics/booking-reports', { params }),
  getRevenueReports: (params) => axios.get('/analytics/revenue-reports', { params }),
  getPaymentReports: (params) => axios.get('/analytics/payment-reports', { params }),
  getCustomerAnalytics: (params) => axios.get('/analytics/customer-analytics', { params }),
  exportToPDF: (type, params) => axios.get(`/analytics/export-pdf/${type}`, { params, responseType: 'blob' }),
  exportToExcel: (type, params) => axios.get(`/analytics/export-excel/${type}`, { params, responseType: 'blob' }),
};