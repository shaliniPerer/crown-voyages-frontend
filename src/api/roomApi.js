import axios from './axios';

// Room APIs
export const roomApi = {
  getRooms: (params) => axios.get('/rooms', { params }),
  getRoomById: (id) => axios.get(`/rooms/${id}`),
  createRoom: (data) => axios.post('/rooms', data),
  updateRoom: (id, data) => axios.patch(`/rooms/${id}`, data),
  deleteRoom: (id) => axios.delete(`/rooms/${id}`),
  getRoomsByResort: (resortId) => axios.get(`/rooms/resort/${resortId}`),
};