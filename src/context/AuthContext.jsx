import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // ✅ FIXED LOGIN
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });

      console.log('🟢 AuthContext login response:', response.data);

      const token = response.data.token;
      const userData = response.data.data; // ✅ CORRECT

      console.log('🟡 token:', token);
      console.log('🟢 userData:', userData);

      // Store data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/auth/signup', userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
