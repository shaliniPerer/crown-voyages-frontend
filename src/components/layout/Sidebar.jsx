import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiCalendar, FiMap, FiGrid, FiFileText, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    // { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/booking', label: 'Booking', icon: FiCalendar },
    { path: '/billing', label: 'Billing & Invoices', icon: FiFileText },
    { path: '/resorts', label: 'Resort Management', icon: FiMap },
    { path: '/rooms', label: 'Room Management', icon: FiGrid },
    
  ];

  // Add user management for admin only
  if (user?.role === 'Admin') {
    menuItems.push({ path: '/users', label: 'User Management', icon: FiUsers });
  }

  return (
    <div className="w-64 bg-luxury-dark border-r border-gold-800/30 h-screen sticky top-0 flex-col hidden lg:flex">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gold-800/30">
        <h1 className="text-3xl font-luxury font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
          Crown Voyages
        </h1>
        <p className="text-lg text-gray-500 mt-1">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black shadow-gold'
                      : 'text-gray-400 hover:text-gold-500 hover:bg-luxury-light'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="px-6 py-4 border-t border-gold-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-black font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gold-600">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;