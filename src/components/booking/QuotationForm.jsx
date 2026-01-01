import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

// Quotation Form Component
export const QuotationForm = ({ onSubmit, resorts = [], initialData = {} }) => {
  const [formData, setFormData] = useState({
    customerName: initialData.customerName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    resort: initialData.resort || '',
    checkIn: initialData.checkIn || '',
    checkOut: initialData.checkOut || '',
    adults: initialData.adults || 2,
    children: initialData.children || 0,
    roomType: initialData.roomType || '',
    amount: initialData.amount || '',
    notes: initialData.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Customer Name"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <Select
          label="Resort"
          options={resorts.map(r => ({ value: r._id, label: r.name }))}
          value={formData.resort}
          onChange={(e) => setFormData({ ...formData, resort: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Check-in Date"
          type="date"
          value={formData.checkIn}
          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
          required
        />
        <Input
          label="Check-out Date"
          type="date"
          value={formData.checkOut}
          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Adults"
          type="number"
          min="1"
          value={formData.adults}
          onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
          required
        />
        <Input
          label="Children"
          type="number"
          min="0"
          value={formData.children}
          onChange={(e) => setFormData({ ...formData, children: e.target.value })}
        />
        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />

      <Button type="submit" variant="primary" className="w-full">
        Create Quotation
      </Button>
    </form>
  );
};