import axios from './axios';


// LOGIN
export const loginApi = async (email, password) => {
  const response = await axios.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// SIGNUP
export const signupApi = async (userData) => {
  const response = await axios.post('/auth/signup', userData);
  return response.data;
};

// (Optional future use)
export const logoutApi = async () => {
  return Promise.resolve();
};
