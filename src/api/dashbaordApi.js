import axios from './axios';

// Dashboard APIs
export const dashboardApi = {
  getMetrics: () => axios.get('/dashboard/metrics'),
  getUpcomingBookings: (params) => axios.get('/dashboard/upcoming-bookings', { params }),
  getOutstandingPayments: () => axios.get('/dashboard/outstanding-payments'),
  getRevenueChart: () => axios.get('/dashboard/revenue-chart'),
  getLeadFunnel: () => axios.get('/dashboard/lead-funnel'),
  getLeadStatus: () => axios.get('/dashboard/lead-status'),
  getVoucherTrends: (period) => axios.get(`/dashboard/voucher-trends?period=${period}`),
  getResortAnalysis: (period) => axios.get(`/dashboard/resort-analysis?period=${period}`),
  getRoomAnalysis: (period) => axios.get(`/dashboard/room-analysis?period=${period}`),
  getUserAnalysis: (period) => axios.get(`/dashboard/user-analysis?period=${period}`),
};