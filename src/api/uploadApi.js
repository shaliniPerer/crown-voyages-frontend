import axios from './axios';

// Upload APIs
export const uploadApi = {
  uploadImage: (formData) => axios.post('/upload/image', formData),
  uploadMultipleImages: (formData) => axios.post('/upload/images', formData),
};