import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { toast } from 'react-toastify';
import { FiBell, FiClock, FiMail, FiTrash2, FiEdit } from 'react-icons/fi';

const ReminderScheduler = ({ reminders = [], onSuccess, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reminderType: 'before',
    days: 3,
    frequency: 'once',
    subject: '',
    template: '',
    enabled: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      reminderType: reminder.reminderType,
      days: reminder.days,
      frequency: reminder.frequency,
      subject: reminder.subject,
      template: reminder.template,
      enabled: reminder.enabled
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reminderData = {
        ...formData,
        days: parseInt(formData.days)
      };

      if (editingReminder) {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/reminders/${editingReminder._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(reminderData)
        });
        toast.success('Reminder updated successfully');
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(reminderData)
        });
        toast.success('Reminder created successfully');
      }

      // Reset form
      setFormData({
        reminderType: 'before',
        days: 3,
        frequency: 'once',
        subject: '',
        template: '',
        enabled: true
      });
      setShowForm(false);
      setEditingReminder(null);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  const reminderTypes = [
    { value: 'before', label: 'Before Due Date' },
    { value: 'on', label: 'On Due Date' },
    { value: 'after', label: 'After Due Date (Overdue)' },
  ];

  const frequencyOptions = [
    { value: 'once', label: 'Send Once' },
    { value: 'daily', label: 'Daily Until Paid' },
    { value: 'weekly', label: 'Weekly Until Paid' },
  ];

  const defaultTemplates = {
    before: `Dear {customer_name},

This is a friendly reminder that your invoice {invoice_number} of ${'{amount}'} is due on {due_date}.

Please ensure payment is made by the due date to avoid any late fees.

Thank you for your business!`,
    on: `Dear {customer_name},

This is a reminder that your invoice {invoice_number} of ${'{amount}'} is due today.

Please process your payment at your earliest convenience.

Thank you!`,
    after: `Dear {customer_name},

Your invoice {invoice_number} of ${'{amount}'} is now overdue. The due date was {due_date}.

Please make payment immediately to avoid additional late fees.

If you have already made payment, please disregard this notice.

Thank you for your prompt attention.`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBell className="w-6 h-6 text-gold-500" />
          <h3 className="text-xl font-semibold text-gold-500">Payment Reminders</h3>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            size="small"
            icon={FiBell}
            onClick={() => setShowForm(true)}
          >
            Create Reminder
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-luxury space-y-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">
            {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Reminder Type"
              name="reminderType"
              value={formData.reminderType}
              onChange={(e) => {
                handleChange(e);
                // Set default template
                if (!formData.template) {
                  setFormData(prev => ({
                    ...prev,
                    template: defaultTemplates[e.target.value],
                    subject: e.target.value === 'before' 
                      ? 'Upcoming Payment Due' 
                      : e.target.value === 'on' 
                        ? 'Payment Due Today' 
                        : 'Overdue Payment Notice'
                  }));
                }
              }}
              options={reminderTypes}
              icon={FiClock}
              required
            />

            <Input
              label="Days"
              name="days"
              type="number"
              min="1"
              max="90"
              value={formData.days}
              onChange={handleChange}
              icon={FiClock}
              required
            />

            <Select
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              options={frequencyOptions}
              required
            />
          </div>

          <Input
            label="Email Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            icon={FiMail}
            placeholder="e.g., Payment Reminder for Invoice"
            required
          />

          <Textarea
            label="Email Template"
            name="template"
            value={formData.template}
            onChange={handleChange}
            rows={8}
            placeholder="Use {customer_name}, {invoice_number}, {amount}, {due_date} as placeholders"
            required
          />

          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-semibold mb-2">Available Placeholders:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="text-gold-600">{'{customer_name}'}</code> - Customer's name</li>
              <li><code className="text-gold-600">{'{invoice_number}'}</code> - Invoice number</li>
              <li><code className="text-gold-600">{'{amount}'}</code> - Invoice amount</li>
              <li><code className="text-gold-600">{'{due_date}'}</code> - Payment due date</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gold-800/30">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              {editingReminder ? 'Update Reminder' : 'Create Reminder'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingReminder(null);
                setFormData({
                  reminderType: 'before',
                  days: 3,
                  frequency: 'once',
                  subject: '',
                  template: '',
                  enabled: true
                });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Existing Reminders */}
      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder._id} className="card-luxury">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-100">{reminder.subject}</h4>
                    <Badge variant={reminder.enabled ? 'green' : 'gray'}>
                      {reminder.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="text-gray-100 capitalize">{reminder.reminderType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Days</p>
                      <p className="text-gray-100">{reminder.days} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Frequency</p>
                      <p className="text-gray-100 capitalize">{reminder.frequency}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {reminder.template}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={FiEdit}
                    onClick={() => handleEdit(reminder)}
                  >
                    Edit
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={FiTrash2}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this reminder?')) {
                          onDelete(reminder._id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-12 card-luxury">
          <FiBell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg mb-2">No reminders configured</p>
          <p className="text-gray-500 text-sm mb-4">
            Set up automated payment reminders to improve collection rates
          </p>
          <Button
            variant="primary"
            icon={FiBell}
            onClick={() => setShowForm(true)}
          >
            Create Your First Reminder
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReminderScheduler;