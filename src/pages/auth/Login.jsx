import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Navigate to dashboard if user is already logged in
  useEffect(() => {
      console.log('🔄 useEffect fired');
  console.log('👤 user from AuthContext:', user);
    if (user) {
      console.log('✅ User exists → navigating to /dashboard');
      navigate('/dashboard', { replace: true });
      } else {
      console.log('⛔ User is null → staying on login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      // No need to call navigate here; useEffect will handle it after `user` updates
    } catch (err) {
      console.error('Login failed:', err);
    }

    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-luxury font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
            Crown Voyages
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-luxury font-semibold text-gray-800 mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={FiMail}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={FiLock}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2 accent-gold-600" />
                Remember me
              </label>
              <a href="#" className="text-gold-600 hover:text-gold-500">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-gold-600 hover:text-gold-500 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © 2025 Crown Voyages. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
