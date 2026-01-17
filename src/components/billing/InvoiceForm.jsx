import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { bookingApi } from '../../api/services';
import { toast } from 'react-toastify';
import { FiFileText, FiDollarSign, FiCalendar } from 'react-icons/fi';

const InvoiceForm = ({ invoice = null, onSuccess, onCancel }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking: invoice?.booking?._id || '',
    customerName: invoice?.customerName || '',
    email: invoice?.email || '',
    phone: invoice?.phone || '',
    totalAmount: invoice?.totalAmount || '',
    totalNetAmount: invoice?.totalNetAmount || 0,
    greenTax: invoice?.greenTax || 0,
    tgst: invoice?.tgst || 0,
    taxAmount: invoice?.taxAmount || 0,
    discountAmount: invoice?.discountAmount || 0,
    dueDate: invoice?.dueDate || '',
    notes: invoice?.notes || '',
    items: invoice?.items || []
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.getBookings({ status: 'Confirmed' });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      
      // Auto-calculate T-GST if totalNetAmount changes
      if (name === 'totalNetAmount') {
        const net = parseFloat(value) || 0;
        newState.tgst = (net * 0.17).toFixed(2);
      }
      return newState;
    });
  };

  const handleBookingSelect = (e) => {
    const bookingId = e.target.value;
    const selectedBooking = bookings.find(b => b._id === bookingId);
    
    if (selectedBooking) {
      const bookingTotal = parseFloat(selectedBooking.totalAmount) || 0;
      // Calculate net amount by backing out 17% T-GST
      const netAmount = (bookingTotal / 1.17).toFixed(2);
      const tgstAmount = (bookingTotal - parseFloat(netAmount)).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        booking: bookingId,
        customerName: selectedBooking.guestName,
        email: selectedBooking.email,
        phone: selectedBooking.phone,
        totalAmount: bookingTotal,
        totalNetAmount: netAmount,
        tgst: tgstAmount,
        greenTax: 0 // Assuming Green Tax is separate or already handled
      }));
    } else {
      setFormData(prev => ({ ...prev, booking: bookingId }));
    }
  };

  const calculateFinalAmount = () => {
    const net = parseFloat(formData.totalNetAmount) || 0;
    const greenTax = parseFloat(formData.greenTax) || 0;
    const tgst = parseFloat(formData.tgst) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    return (net + greenTax + tgst - discount).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.totalNetAmount), // Backend uses 'amount' for subtotal
        totalAmount: parseFloat(formData.totalNetAmount),
        totalNetAmount: parseFloat(formData.totalNetAmount),
        greenTax: parseFloat(formData.greenTax),
        tgst: parseFloat(formData.tgst),
        discountAmount: parseFloat(formData.discountAmount),
        discountValue: parseFloat(formData.discountAmount), // Backend uses discountValue
        finalAmount: parseFloat(calculateFinalAmount())
      };

      if (invoice) {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/invoices/${invoice._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(invoiceData)
        });
        toast.success('Invoice updated successfully');
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/billing/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(invoiceData)
        });
        toast.success('Invoice created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FiFileText className="w-6 h-6 text-gold-500" />
        <h3 className="text-xl font-semibold text-gold-500">
          {invoice ? 'Update Invoice' : 'Create New Invoice'}
        </h3>
      </div>

      {/* Booking Selection */}
      <Select
        label="Select Booking"
        name="booking"
        value={formData.booking}
        onChange={handleBookingSelect}
        options={bookings.map(b => ({ 
          value: b._id, 
          label: `${b.bookingNumber} - ${b.guestName} (${b.resort?.name})`
        }))}
        placeholder="Choose a booking"
        required
      />

      {/* Customer Information */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Customer Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            icon={FiFileText}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Invoice Amounts */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Financial Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Net Amount ($)"
            name="totalNetAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.totalNetAmount}
            onChange={handleChange}
            icon={FiDollarSign}
            required
          />
          <Input
            label="Green Tax ($)"
            name="greenTax"
            type="number"
            step="0.01"
            min="0"
            value={formData.greenTax}
            onChange={handleChange}
          />
          <Input
            label="T-GST 17.00% ($)"
            name="tgst"
            type="number"
            step="0.01"
            min="0"
            value={formData.tgst}
            onChange={handleChange}
          />
          <Input
            label="Discount ($)"
            name="discountAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.discountAmount}
            onChange={handleChange}
          />
        </div>
        
        {/* Final Amount Display */}
        <div className="pt-4 border-t border-gold-800/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">GRAND TOTAL (TAXES INCLUDED):</span>
            <span className="text-2xl font-bold text-gold-500">
              ${calculateFinalAmount()}
            </span>
          </div>
        </div>
      </div>

      {/* Due Date */}
      <Input
        label="Due Date"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        icon={FiCalendar}
        required
        min={new Date().toISOString().split('T')[0]}
      />

      {/* Notes */}
      <Textarea
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={4}
        placeholder="Add any additional notes or payment instructions..."
      />

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gold-800/30">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          loading={loading}
          className="flex-1"
          icon={FiFileText}
        >
          {invoice ? 'Update Invoice' : 'Generate Invoice'}
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

export default InvoiceForm;