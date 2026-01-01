import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { FiUser, FiMail, FiPhone, FiLock, FiActivity } from 'react-icons/fi';

// User List Component
export const UserList = ({ users = [], onEdit, onDelete, onViewActivity }) => {
  const getRoleBadge = (role) => {
    const roleMap = {
      'Admin': 'gold',
      'Sales Agent': 'blue',
      'Finance': 'green'
    };
    return roleMap[role] || 'gray';
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-luxury">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-black font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-100">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <Badge variant={getRoleBadge(user.role)}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <Badge variant="green">Active</Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button variant="outline" size="small" onClick={() => onEdit(user)}>
                        Edit
                      </Button>
                    )}
                    {onViewActivity && (
                      <Button 
                        variant="outline" 
                        size="small" 
                        icon={FiActivity}
                        onClick={() => onViewActivity(user._id)}
                      >
                        Activity
                      </Button>
                    )}
                    {onDelete && (
                      <Button 
                        variant="outline" 
                        size="small" 
                        onClick={() => onDelete(user._id)}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-gray-400 py-8">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Activity Log Component
export const ActivityLog = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    // You can customize icons based on activity type
    return FiActivity;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'create': 'text-green-400',
      'update': 'text-blue-400',
      'delete': 'text-red-400',
      'login': 'text-gold-400',
    };
    return colorMap[type] || 'text-gray-400';
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {activities.length > 0 ? (
        activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div key={index} className="flex gap-4 border-l-2 border-gold-600 pl-4 py-2">
              <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-100 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <FiActivity className="w-12 h-12 mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400">No activity logs found</p>
        </div>
      )}
    </div>
  );
};


