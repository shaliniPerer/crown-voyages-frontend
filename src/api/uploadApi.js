import axios from './axios';

// Upload APIs
export const uploadApi = {
  uploadImage: (formData) => axios.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultipleImages: (formData) => axios.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};