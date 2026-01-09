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

  const logout = (val) => {
    const message = typeof val === 'string' ? val : 'Logged out successfully';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info(message);
  };

  // Auto-logout after 1 hour of inactivity
  useEffect(() => {
    if (!user) return;

    const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 hour
    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        logout('Session expired due to inactivity');
      }, TIMEOUT_DURATION);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    // Throttle the event listener to improve performance
    let isThrottled = false;
    const handleActivity = () => {
      if (!isThrottled) {
        resetTimer();
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 1000);
      }
    };

    // Initialize timer
    resetTimer();

    // Listen for activity
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
