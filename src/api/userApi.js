import axios from './axios';

// User APIs
export const userApi = {
  getUsers: (params) => axios.get('/users', { params }),
  getUserById: (id) => axios.get(`/users/${id}`),
  createUser: (data) => axios.post('/users', data),
  updateUser: (id, data) => axios.patch(`/users/${id}`, data),
  deleteUser: (id) => axios.delete(`/users/${id}`),
  getActivityLogs: (userId) => axios.get(`/users/${userId}/activity-logs`),
};