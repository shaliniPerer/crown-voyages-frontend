import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { billingApi } from '../../api/services';
import { toast } from 'react-toastify';
import { FiDollarSign, FiCreditCard, FiCalendar } from 'react-icons/fi';

const PaymentForm = ({ payment = null, onSuccess, onCancel }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoice: payment?.invoice?._id || '',
    amount: payment?.amount || '',
    method: payment?.method || 'Cash',
    transactionId: payment?.transactionId || '',
    date: payment?.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: payment?.notes || ''
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await billingApi.getInvoices({ status: ['Pending', 'Partial'] });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    const invoice = invoices.find(inv => inv._id === invoiceId);
    
    setSelectedInvoice(invoice);
    setFormData(prev => ({
      ...prev,
      invoice: invoiceId,
      amount: invoice ? (invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2) : ''
    }));
  };

  const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Credit/Debit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Online Payment', label: 'Online Payment' },
    { value: 'Mobile Payment', label: 'Mobile Payment' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment amount
    if (selectedInvoice) {
      const balance = selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0);
      if (parseFloat(formData.amount) > balance) {
        toast.error(`Payment amount cannot exceed outstanding balance of $${balance.toFixed(2)}`);
        return;
      }
    }

    setLoading(true);

    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (payment) {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/payments/${payment._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(paymentData)
        });
        toast.success('Payment updated successfully');
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(paymentData)
        });
        toast.success('Payment recorded successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FiDollarSign className="w-6 h-6 text-gold-500" />
        <h3 className="text-xl font-semibold text-gold-500">
          {payment ? 'Update Payment' : 'Record New Payment'}
        </h3>
      </div>

      {/* Invoice Selection */}
      <Select
        label="Select Invoice"
        name="invoice"
        value={formData.invoice}
        onChange={handleInvoiceSelect}
        options={invoices.map(inv => {
          const balance = inv.totalAmount - (inv.paidAmount || 0);
          return {
            value: inv._id,
            label: `${inv.invoiceNumber} - ${inv.customerName} (Balance: $${balance.toFixed(2)})`
          };
        })}
        placeholder="Choose an invoice"
        required
      />

      {/* Selected Invoice Info */}
      {selectedInvoice && (
        <div className="p-4 bg-luxury-lighter rounded-lg border border-gold-800/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Customer:</p>
              <p className="font-semibold text-gray-100">{selectedInvoice.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400">Invoice Total:</p>
              <p className="font-semibold text-gray-100">${selectedInvoice.totalAmount?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Already Paid:</p>
              <p className="font-semibold text-green-400">${(selectedInvoice.paidAmount || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Outstanding Balance:</p>
              <p className="font-semibold text-red-400">
                ${(selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="space-y-4 p-4 bg-luxury-lighter rounded-lg border border-gold-800/20">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Payment Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Payment Amount ($)"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={selectedInvoice ? (selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)) : undefined}
            value={formData.amount}
            onChange={handleChange}
            icon={FiDollarSign}
            required
          />

          <Select
            label="Payment Method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            options={paymentMethods}
            icon={FiCreditCard}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Payment Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            icon={FiCalendar}
            max={new Date().toISOString().split('T')[0]}
            required
          />

          <Input
            label="Transaction ID (Optional)"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="e.g., TXN123456789"
          />
        </div>
      </div>

      {/* Notes */}
      <Textarea
        label="Payment Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        placeholder="Add any additional notes about this payment..."
      />

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gold-800/30">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          loading={loading}
          className="flex-1"
          icon={FiDollarSign}
        >
          {payment ? 'Update Payment' : 'Record Payment'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;