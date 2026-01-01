import axios from './axios';

// Dashboard APIs
export const dashboardApi = {
  getMetrics: () => axios.get('/dashboard/metrics'),
  getUpcomingBookings: (params) => axios.get('/dashboard/upcoming-bookings', { params }),
  getOutstandingPayments: () => axios.get('/dashboard/outstanding-payments'),
  getRevenueChart: (period) => axios.get(`/dashboard/revenue-chart?period=${period}`),
  getLeadFunnel: () => axios.get('/dashboard/lead-funnel'),
};