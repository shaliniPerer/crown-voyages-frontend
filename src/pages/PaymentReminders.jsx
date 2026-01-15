import { useState, useEffect } from 'react';
import { FiPlus, FiBell, FiClock, FiMail, FiTrash2, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { billingApi } from '../api/billingApi';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';

import { DEFAULT_REMINDER_TEMPLATES } from '../utils/constants';

const PaymentReminders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [overdueWithoutReminders, setOverdueWithoutReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showReminderDraftModal, setShowReminderDraftModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [reminderDraft, setReminderDraft] = useState({
    subject: '',
    template: '',
    type: 'before'
  });
  const [sendingReminder, setSendingReminder] = useState(false);
  const [formData, setFormData] = useState({
    reminderType: 'before',
    days: 3,
    frequency: 'once',
    subject: 'Payment Reminder',
    emailTemplate: '',
    enabled: true,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'active') {
        const res = await billingApi.getReminders();
        setReminders(res.data.data || res.data || []);
      } else if (activeTab === 'invoices') {
        const res = await bookingApi.getInvoices();
        const allInvoices = res.data.data || res.data || [];
        // Filter unpaid and partially paid invoices
        const unpaid = allInvoices.filter(
          inv => inv.balance > 0 && (inv.status === 'Pending' || inv.status === 'Partial' || inv.status === 'Overdue')
        );
        setUnpaidInvoices(unpaid);
      } else if (activeTab === 'overdue') {
        // Fetch invoices and reminders to identify overdue without reminders
        const [invoicesRes, remindersRes] = await Promise.all([
          bookingApi.getInvoices(),
          billingApi.getReminders()
        ]);
        
        const allInvoices = invoicesRes.data.data || invoicesRes.data || [];
        const activeReminders = (remindersRes.data.data || remindersRes.data || []).filter(r => r.enabled);
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter overdue invoices (past due date with unpaid balance)
        const overdue = allInvoices.filter(inv => {
          const dueDate = new Date(inv.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return inv.balance > 0 && dueDate < today && inv.status !== 'Paid';
        });
        
        setOverdueWithoutReminders(overdue);
      } else if (activeTab === 'history') {
        try {
          const res = await billingApi.getHistory();
          const logs = res.data.data || res.data || [];
          // Filter only reminder-related logs
          const reminderLogs = logs.filter(log => 
            log.description?.toLowerCase().includes('reminder') || 
            log.action === 'send_email'
          );
          setHistory(reminderLogs);
        } catch (e) {
          console.log("History API not ready");
          setHistory([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleOpenModal = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        reminderType: reminder.reminderType,
        days: reminder.days,
        frequency: reminder.frequency,
        subject: reminder.subject,
        emailTemplate: reminder.template,
        enabled: reminder.enabled,
      });
    } else {
      setEditingReminder(null);
      setFormData({
        reminderType: 'before',
        days: 3,
        frequency: 'once',
        subject: 'Payment Reminder',
        emailTemplate: DEFAULT_REMINDER_TEMPLATES.before,
        enabled: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reminderData = {
        reminderType: formData.reminderType,
        days: parseInt(formData.days),
        frequency: formData.frequency,
        subject: formData.subject,
        template: formData.emailTemplate,
        enabled: formData.enabled,
      };

      if (editingReminder) {
        await billingApi.updateReminder(editingReminder._id, reminderData);
        toast.success('Reminder updated successfully');
      } else {
        await billingApi.createReminder(reminderData);
        toast.success('Reminder created successfully');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await billingApi.deleteReminder(id);
      toast.success('Reminder deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const handleCreateReminderForOverdue = async (invoice) => {
    // Open modal with pre-filled data for overdue invoice
    setEditingReminder(null);
    setFormData({
      reminderType: 'after',
      days: 0,
      frequency: 'daily',
      subject: `Payment Reminder for Overdue Invoice ${invoice.invoiceNumber}`,
      emailTemplate: DEFAULT_REMINDER_TEMPLATES.after,
      enabled: true,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (reminder) => {
    try {
      await billingApi.updateReminder(reminder._id, {
        ...reminder,
        enabled: !reminder.enabled,
      });
      toast.success(`Reminder ${!reminder.enabled ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendReminder = async (invoice) => {
    try {
      if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
        toast.info('This invoice is already paid or cancelled.');
        return;
      }
      
      const type = invoice.status === 'Overdue' ? 'after' : 'before';
      
      let subject = `Payment Reminder for Invoice ${invoice.invoiceNumber}`;
      let template = DEFAULT_REMINDER_TEMPLATES[type] || DEFAULT_REMINDER_TEMPLATES.before;

      try {
        const matchingReminder = reminders.find(r => r.enabled && r.reminderType === type);
        if (matchingReminder) {
          subject = matchingReminder.subject;
          template = matchingReminder.template;
        }
      } catch (e) {
        console.log("Error matching reminders");
      }

      setSelectedInvoice(invoice);
      setReminderDraft({
        subject,
        template,
        type
      });
      setShowReminderDraftModal(true);
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error('Failed to prepare reminder');
    }
  };

  const handleConfirmSendReminder = async (e) => {
    e.preventDefault();
    try {
      setSendingReminder(true);
      await billingApi.sendManualReminder(selectedInvoice._id, {
        type: reminderDraft.type,
        subject: reminderDraft.subject,
        template: reminderDraft.template
      });
      toast.success('Reminder email sent successfully');
      setShowReminderDraftModal(false);
      if (activeTab === 'history') fetchData();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder email');
    } finally {
      setSendingReminder(false);
    }
  };

  const tabs = [
    { id: 'active', label: 'Active Reminders' },
    { id: 'invoices', label: 'Pending Invoices' },
    { id: 'overdue', label: 'Overdue (No Reminder)' },
    { id: 'history', label: 'Reminder History' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Payment Reminders</h1>
          <p className="text-gray-900 mt-1">Automated payment follow-ups and tracking</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'active' && (
            <Button variant="primary" icon={FiPlus} onClick={() => handleOpenModal()}>
              Create Reminder
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-luxury-light p-1 rounded-lg border border-gold-800/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black shadow-gold'
                : 'text-gray-400 hover:text-gold-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Reminders Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <Card key={reminder._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FiBell className="text-gold-500 w-6 h-6" />
                      <h3 className="text-xl font-semibold text-gray-100">{reminder.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reminder.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {reminder.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Trigger</p>
                        <p className="text-gray-100 font-medium capitalize">
                          {reminder.reminderType === 'before' && `${reminder.days} days before due date`}
                          {reminder.reminderType === 'on' && 'On due date'}
                          {reminder.reminderType === 'after' && `${reminder.days} days after due date`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="text-gray-100 font-medium capitalize">{reminder.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-gray-100 font-medium">
                          {new Date(reminder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-luxury-light p-4 rounded-lg border border-gold-800/20">
                      <p className="text-sm text-gray-500 mb-2">Email Template Preview:</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {reminder.template?.substring(0, 200)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="small"
                      icon={reminder.enabled ? FiX : FiCheck}
                      onClick={() => handleToggleStatus(reminder)}
                    >
                      {reminder.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      icon={FiEdit}
                      onClick={() => handleOpenModal(reminder)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      icon={FiTrash2}
                      onClick={() => handleDelete(reminder._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <FiBell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Active Reminders</h3>
              <p className="text-gray-500 mb-6">Create your first automated payment reminder</p>
              <Button variant="primary" icon={FiPlus} onClick={() => handleOpenModal()}>
                Create Reminder
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Pending Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.length > 0 ? (
                  unpaidInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="font-mono text-gold-500">{invoice.invoiceNumber}</td>
                      <td className="font-medium text-gray-100">{invoice.customerName}</td>
                      <td className="font-semibold">${(invoice.finalAmount || 0).toLocaleString()}</td>
                      <td className="text-green-400">${(invoice.paidAmount || 0).toLocaleString()}</td>
                      <td className="font-semibold text-red-400">${(invoice.balance || 0).toLocaleString()}</td>
                      <td className="text-gray-400">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === 'Overdue' ? 'bg-red-500/20 text-red-400' :
                          invoice.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiMail}
                          onClick={() => handleSendReminder(invoice)}
                          disabled={sendingReminder}
                        >
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 py-8">
                      No pending invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Overdue Invoices Requiring Reminders Tab */}
      {activeTab === 'overdue' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Balance Due</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueWithoutReminders.length > 0 ? (
                  overdueWithoutReminders.map((invoice) => {
                    const today = new Date();
                    const dueDate = new Date(invoice.dueDate);
                    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={invoice._id}>
                        <td className="font-mono text-gold-500">{invoice.invoiceNumber}</td>
                        <td className="font-mono text-gray-300">
                          {invoice.booking?.bookingNumber || invoice.lead?.leadNumber || 'N/A'}
                        </td>
                        <td className="font-medium text-gray-100">{invoice.customerName}</td>
                        <td className="font-semibold">${(invoice.finalAmount || 0).toLocaleString()}</td>
                        <td className="font-semibold text-red-500">${(invoice.balance || 0).toLocaleString()}</td>
                        <td className="text-gray-400">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-medium">
                            {daysOverdue} days
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="primary"
                            size="small"
                            icon={FiBell}
                            onClick={() => handleCreateReminderForOverdue(invoice)}
                          >
                            Create Reminder
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 py-8">
                      No overdue invoices requiring reminders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((log) => (
                    <tr key={log._id}>
                      <td className="text-gray-400 text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded bg-gold-500/20 text-gold-400 text-xs font-medium capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-gray-100">{log.description}</td>
                      <td className="text-gold-500">{log.user?.name || 'System'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-400 py-8">
                      No reminder history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reminder Type
              </label>
              <select
                className="input-luxury w-full"
                value={formData.reminderType}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    reminderType: e.target.value,
                    emailTemplate: DEFAULT_REMINDER_TEMPLATES[e.target.value],
                  });
                }}
                required
              >
                <option value="before">Before Due Date</option>
                <option value="on">On Due Date</option>
                <option value="after">After Due Date (Overdue)</option>
              </select>
            </div>

            <Input
              label="Days"
              type="number"
              min="1"
              max="90"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              required
              disabled={formData.reminderType === 'on'}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency
              </label>
              <select
                className="input-luxury w-full"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              >
                <option value="once">Send Once</option>
                <option value="daily">Daily Until Paid</option>
                <option value="weekly">Weekly Until Paid</option>
              </select>
            </div>
          </div>

          <Input
            label="Email Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Payment Reminder"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Template
            </label>
            <textarea
              className="input-luxury w-full"
              rows={8}
              value={formData.emailTemplate}
              onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
              placeholder="Use {customer_name}, {invoice_number}, {amount}, {due_date} as placeholders"
              required
            />
          </div>

          <div className="text-sm text-gray-400 bg-luxury-light p-3 rounded-lg border border-gold-800/20">
            <p className="font-semibold mb-2">Available Placeholders:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="text-gold-500">{'{customer_name}'}</code> - Customer's name</li>
              <li><code className="text-gold-500">{'{invoice_number}'}</code> - Invoice number</li>
              <li><code className="text-gold-500">{'{amount}'}</code> - Invoice amount</li>
              <li><code className="text-gold-500">{'{due_date}'}</code> - Payment due date</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="enabled" className="text-sm text-gray-300">
              Enable this reminder immediately
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gold-800/30">
            <Button type="submit" variant="primary" className="flex-1">
              {editingReminder ? 'Update Reminder' : 'Create Reminder'}
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

      {/* Reminder Preview Modal */}
      <Modal 
        isOpen={showReminderDraftModal} 
        onClose={() => setShowReminderDraftModal(false)} 
        title="Send Manual Reminder"
      >
        <form onSubmit={handleConfirmSendReminder} className="space-y-4">
          <div className="bg-gold-500/10 p-3 rounded-lg border border-gold-500/20 mb-4">
            <p className="text-sm text-gold-500">
              <span className="font-bold">Recipient:</span> {selectedInvoice?.customerName} ({selectedInvoice?.email})
            </p>
            <p className="text-sm text-gold-500">
              <span className="font-bold">Invoice:</span> {selectedInvoice?.invoiceNumber} - ${selectedInvoice?.balance?.toLocaleString()} outstanding
            </p>
          </div>

          <Input
            label="Email Subject"
            value={reminderDraft.subject}
            onChange={(e) => setReminderDraft({ ...reminderDraft, subject: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Template
            </label>
            <textarea
              className="input-luxury w-full"
              rows={10}
              value={reminderDraft.template}
              onChange={(e) => setReminderDraft({ ...reminderDraft, template: e.target.value })}
              placeholder="Use {customer_name}, {invoice_number}, {amount}, {due_date} as placeholders"
              required
            />
          </div>

          <div className="text-[10px] text-gray-400 bg-luxury-light p-2 rounded border border-gold-800/20">
            <p className="font-semibold mb-1 uppercase">Available Placeholders:</p>
            <div className="grid grid-cols-2 gap-x-2">
              <span>{'{customer_name}'}</span>
              <span>{'{invoice_number}'}</span>
              <span>{'{amount}'}</span>
              <span>{'{due_date}'}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1"
              disabled={sendingReminder}
            >
              {sendingReminder ? 'Sending...' : 'Send Reminder Now'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowReminderDraftModal(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentReminders;
