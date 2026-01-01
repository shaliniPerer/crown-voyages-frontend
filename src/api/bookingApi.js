import axios from './axios';

export const bookingApi = {
  createLead: (data) => axios.post('/bookings/lead', data),
  getLeads: (params) => axios.get('/bookings/leads', { params }),
  createQuotation: (data) => axios.post('/bookings/quotation', data),
  getQuotations: (params) => axios.get('/bookings/quotations', { params }),
  updateQuotationStatus: (id, status) => axios.patch(`/bookings/quotation/${id}/status`, { status }),
  createQuotationVersion: (quotationId, data) => axios.post(`/bookings/quotation/${quotationId}/version`, data),
  sendQuotationEmail: (id) => axios.post(`/bookings/quotation/${id}/send-email`),
  exportQuotationPDF: (id) => axios.get(`/bookings/quotation/${id}/pdf`, { responseType: 'blob' }),
  convertToBooking: (quotationId, data) => axios.post(`/bookings/quotation/${quotationId}/convert`, data),
  getBookings: (params) => axios.get('/bookings', { params }),
  getBookingById: (id) => axios.get(`/bookings/${id}`),
  updateBooking: (id, data) => axios.patch(`/bookings/${id}`, data),
  deleteBooking: (id) => axios.delete(`/bookings/${id}`),
};
