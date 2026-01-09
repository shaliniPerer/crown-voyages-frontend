import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiActivity } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { userApi } from '../api/userApi';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Sales Agent',
    password: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers();
      // Ensure users is always an array
      const userArray = response.data?.data || [];
      setUsers(userArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // fallback
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Sales Agent',
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Sales Agent',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userApi.updateUser(editingUser._id, formData);
        toast.success('User updated successfully');
      } else {
        await userApi.createUser(formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleViewActivity = async (userId) => {
    try {
      const response = await userApi.getActivityLogs(userId);
      const logs = response.data?.data || [];
      setActivityLogs(logs);
      setShowActivityModal(true);
    } catch (error) {
      toast.error('Failed to load activity logs');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'badge-gold';
      case 'Sales Agent':
        return 'badge-blue';
      case 'Finance':
        return 'badge-green';
      default:
        return 'badge-gold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">User Management</h1>
          <p className="text-gray-400 mt-1">Manage system users and roles</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={() => handleOpenModal()}>
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active Admins</h3>
          <p className="text-3xl font-bold text-gold-500">
            {Array.isArray(users) ? users.filter(u => u.role === 'Admin').length : 0}
          </p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Sales Agents</h3>
          <p className="text-3xl font-bold text-blue-500">
            {Array.isArray(users) ? users.filter(u => u.role === 'Sales Agent').length : 0}
          </p>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table-luxury">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-black font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-100">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge-green">Active</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiEdit}
                          onClick={() => handleOpenModal(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiActivity}
                          onClick={() => handleViewActivity(user._id)}
                        >
                          Activity
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiTrash2}
                          onClick={() => handleDelete(user._id)}
                          className="border-red-600 text-red-600 hover:bg-red-600"
                        >
                          Delete
                        </Button>
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
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-gold-500">*</span>
            </label>
            <select
              className="input-luxury w-full"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="Admin">Admin</option>
              <option value="Sales Agent">Sales Agent</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="User Activity Logs"
        size="large"
      >
        <div className="space-y-4">
          {activityLogs.length > 0 ? (
            activityLogs.map((log, index) => (
              <div key={index} className="border-l-2 border-gold-600 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-100 font-medium">{log.action}</p>
                    <p className="text-sm text-gray-400 mt-1">{log.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">No activity logs found</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
