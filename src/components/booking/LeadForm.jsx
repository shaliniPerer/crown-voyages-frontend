import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Lead Form Component
export const LeadForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    customerName: initialData.customerName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    source: initialData.source || '',
    notes: initialData.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Phone', label: 'Phone Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Social Media', label: 'Social Media' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Customer Name"
        icon={FiUser}
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        required
      />
      <Input
        label="Email"
        type="email"
        icon={FiMail}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Phone"
        icon={FiPhone}
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <Select
        label="Lead Source"
        options={sourceOptions}
        value={formData.source}
        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
        required
      />
      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />
      <Button type="submit" variant="primary" className="w-full">
        Create Lead
      </Button>
    </form>
  );
};
