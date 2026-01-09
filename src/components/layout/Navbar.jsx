import React, { useState, useRef, useEffect } from 'react';
import { FiLogOut, FiBell, FiUser, FiSettings, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New booking received', time: '5 min ago', unread: true },
    { id: 2, message: 'Payment confirmed', time: '1 hour ago', unread: true },
    { id: 3, message: 'Resort added successfully', time: '2 hours ago', unread: false },
  ]);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:text-gold-600 transition-colors p-2"
            >
              <FiMenu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Welcome Message */}
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-luxury font-semibold text-gray-900">
              Welcome back, <span className="text-gold-600">{user?.name || 'User'}</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 hidden md:block">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            {/* <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gold-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
            > */}
              {/* <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-gold-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button> */}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-slideDown">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gold-600">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${
                          notification.unread ? 'border-gold-600 bg-gold-50' : 'border-transparent'
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-600">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 text-center">
                  <button className="text-sm text-gold-600 hover:text-gold-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gold-600">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-slideDown">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors flex items-center gap-3">
                    <FiUser className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors flex items-center gap-3">
                    <FiSettings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button (Desktop) */}
          <div className="hidden lg:block">
            <Button 
              variant="outline" 
              size="small" 
              onClick={logout}
              icon={FiLogOut}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;