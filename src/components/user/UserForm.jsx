import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { FiUser, FiMail, FiPhone, FiLock, FiActivity } from 'react-icons/fi';

// User Form Component
export const UserForm = ({ onSubmit, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    role: initialData.role || 'Sales Agent',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isEdit && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const submitData = { ...formData };
    if (isEdit && !formData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }

    onSubmit(submitData);
  };

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Sales Agent', label: 'Sales Agent' },
    { value: 'Finance', label: 'Finance' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        icon={FiUser}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        label="Email Address"
        type="email"
        icon={FiMail}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Input
        label="Phone Number"
        icon={FiPhone}
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />

      <Select
        label="Role"
        options={roleOptions}
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        required
      />

      {!isEdit && (
        <>
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!isEdit}
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={FiLock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required={!isEdit}
          />
        </>
      )}

      {isEdit && (
        <p className="text-sm text-gray-400">Leave password fields empty to keep current password</p>
      )}

      <Button type="submit" variant="primary" className="w-full">
        {isEdit ? 'Update User' : 'Create User'}
      </Button>
    </form>
  );
};