import axios from './axios';

// Resort APIs
export const resortApi = {
  getResorts: (params) => axios.get('/resorts', { params }),
  getResortById: (id) => axios.get(`/resorts/${id}`),
  createResort: (data) => axios.post('/resorts', data),
  updateResort: (id, data) => axios.patch(`/resorts/${id}`, data),
  deleteResort: (id) => axios.delete(`/resorts/${id}`),
};