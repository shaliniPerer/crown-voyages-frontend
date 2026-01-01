import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Booking from './pages/Booking';
import ResortManagement from './pages/ResortManagement';
import RoomManagement from './pages/RoomManagement';
import Billing from './pages/Billing';
import UserManagement from './pages/UserManagement';
import Loader from './components/common/Loader';

function App() {
  const { user, loading } = useAuth();

  // Show loader while AuthContext is checking localStorage
  if (loading) return <Loader />;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Layout */}
        {user && (
          <Route path="/" element={<Layout />}>
            {/* Dashboard as default route */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="booking" element={<Booking />} />
            <Route path="resorts" element={<ResortManagement />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="billing" element={<Billing />} />
            <Route
              path="users"
              element={user?.role === 'Admin' ? <UserManagement /> : <Navigate to="/dashboard" replace />}
            />
          </Route>
        )}

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
