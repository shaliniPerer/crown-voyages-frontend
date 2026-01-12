import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiMail, FiDollarSign, FiDownload, FiTrash2, FiPrinter, FiEye, FiBell } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { billingApi} from '../api/billingApi';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';

import { DEFAULT_REMINDER_TEMPLATES } from '../utils/constants';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('quotations');
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminderHistory, setReminderHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [reportType, setReportType] = useState('quotation');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReminderDraftModal, setShowReminderDraftModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [reminderDraft, setReminderDraft] = useState({
    subject: '',
    template: '',
    type: 'before'
  });
  const [sendingReminder, setSendingReminder] = useState(false);
  const [billingFilters, setBillingFilters] = useState({
    date: '',
    docId: '',
    bookingId: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'quotations') {
        const res = await bookingApi.getQuotations();
        setQuotations(res.data.data || res.data || []);
      } else if (activeTab === 'invoices') {
        // Fetch only invoices created from Booking Management
        const res = await bookingApi.getInvoices();
        setInvoices(res.data.data || res.data || []);
      } else if (activeTab === 'receipts') {
        // Fetch receipts from bookingApi (created in Booking Management)
        const res = await bookingApi.getReceipts?.() || { data: [] };
        setReceipts(res.data.data || res.data || []);
      } else if (activeTab === 'payments') {
        const res = await billingApi.getPayments();
        setPayments(res.data.data || res.data || []);
      } else if (activeTab === 'reminders') {
        const res = await billingApi.getHistory();
        const logs = res.data.data || res.data || [];
        // Filter only reminder-related logs or email sends
        const history = logs.filter(log => 
          log.description?.toLowerCase().includes('reminder') || 
          log.action === 'send_email'
        );
        setReminderHistory(history);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    if (data) {
      setFormData(data);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'invoice') {
        await billingApi.createInvoice(formData);
        toast.success('Invoice created successfully');
      } else if (modalType === 'payment') {
        await billingApi.recordPayment(formData);
        toast.success('Payment recorded successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'quotation') {
        await bookingApi.deleteQuotation(id);
      } else if (type === 'invoice') {
        await bookingApi.deleteInvoice(id);
      } else if (type === 'receipt') {
        await bookingApi.deleteReceipt(id);
      }
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await bookingApi.getReport(reportType, reportPeriod);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${reportPeriod}.pdf`;
      link.click();
      toast.success('Report downloaded successfully');
      setShowReportModal(false);
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleSendEmail = async (id, type = 'invoice') => {
    try {
      if (type === 'quotation') {
        await bookingApi.sendQuotationEmail(id);
      } else if (type === 'invoice') {
        await bookingApi.sendInvoiceEmail(id);
      } else if (type === 'receipt') {
        await bookingApi.sendPaymentReceiptEmail(id);
      }
      toast.success('Email sent successfully');
    } catch (error) {
      console.error('Email error:', error);
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  const handleExportPDF = async (id, type) => {
    try {
      let response;
      let filename;
      
      if (type === 'quotation') {
        response = await bookingApi.exportQuotationPDF(id);
        filename = `quotation-${id}.pdf`;
      } else if (type === 'invoice') {
        response = await bookingApi.exportInvoicePDF(id);
        filename = `invoice-${id}.pdf`;
      } else if (type === 'receipt') {
        response = await bookingApi.exportReceiptPDF(id);
        filename = `receipt-${id}.pdf`;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded`);
    } catch (error) {
      toast.error(`Failed to download ${type}`);
    }
  };

  const handleView = async (item, type) => {
    try {
      let response;
      
      if (type === 'quotation') {
        response = await bookingApi.exportQuotationPDF(item._id);
      } else if (type === 'invoice') {
        response = await bookingApi.exportInvoicePDF(item._id);
      } else if (type === 'receipt') {
        response = await bookingApi.exportReceiptPDF(item._id);
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error(`Failed to view ${type}`);
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
        const res = await billingApi.getReminders();
        const activeReminders = res.data.data || res.data || [];
        const matchingReminder = activeReminders.find(r => r.enabled && r.reminderType === type);
        if (matchingReminder) {
          subject = matchingReminder.subject;
          template = matchingReminder.template;
        }
      } catch (e) {
        console.log("Could not fetch configured reminders, using default");
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
      // Refresh history if we are on the reminders tab
      if (activeTab === 'reminders') fetchData();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder email');
    } finally {
      setSendingReminder(false);
    }
  };

  const tabs = [
    { id: 'quotations', label: 'Quotations' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'receipts', label: 'Receipts' },
    // { id: 'reminders', label: 'Reminders' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Billing & Documents</h1>
          <p className="text-gray-900 mt-1">Manage quotations, invoices, receipts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={FiPrinter} onClick={() => setShowReportModal(true)}>
            Reports
          </Button>
          {/* {activeTab === 'invoices' && (
            <Button variant="primary" icon={FiPlus} onClick={() => handleOpenModal('invoice')}>
              Create Invoice
            </Button>
          )} */}
          {activeTab === 'payments' && (
            <Button variant="primary" icon={FiDollarSign} onClick={() => handleOpenModal('payment')}>
              Record Payment
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

      {/* Search Filters */}
      <Card className="p-4 bg-white/50 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Date"
            type="date"
            value={billingFilters.date}
            onChange={(e) => setBillingFilters(prev => ({ ...prev, date: e.target.value }))}
            className="text-sm"
          />
          <Input
            label="Document ID"
            placeholder="Search Quotation/Invoice/Receipt ID..."
            value={billingFilters.docId}
            onChange={(e) => setBillingFilters(prev => ({ ...prev, docId: e.target.value }))}
            className="text-sm"
          />
          <Input
            label="Booking ID / Lead ID"
            placeholder="Search Booking/Lead ID..."
            value={billingFilters.bookingId}
            onChange={(e) => setBillingFilters(prev => ({ ...prev, bookingId: e.target.value }))}
            className="text-sm"
          />
        </div>
      </Card>

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Quotation ID</th>
                  <th>Date</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.filter(quote => {
                  const matchDate = !billingFilters.date || new Date(quote.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                  const docId = quote.quotationNumber || '';
                  const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                  const bookingRef = quote.lead?.booking?.bookingNumber || quote.lead?.leadNumber || '';
                  const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                  
                  return matchDate && matchDocId && matchBookingId;
                }).length > 0 ? (
                  quotations.filter(quote => {
                    const matchDate = !billingFilters.date || new Date(quote.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                    const docId = quote.quotationNumber || '';
                    const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                    const bookingRef = quote.lead?.booking?.bookingNumber || quote.lead?.leadNumber || '';
                    const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                    
                    return matchDate && matchDocId && matchBookingId;
                  }).map((quote) => (
                    <tr key={quote._id}>
                      <td className="font-mono text-gold-500">{quote.quotationNumber}</td>
                      <td className="text-gray-400 text-sm">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-gray-300">
                        {quote.lead?.booking?.bookingNumber || quote.lead?.leadNumber || '-'}
                      </td>
                      <td className="font-medium text-gray-100">{quote.customerName}</td>
                      <td className="font-semibold">${(quote.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(quote.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(quote.finalAmount || 0).toLocaleString()}</td>
                      <td>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</td>
                      <td className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiEye}
                          onClick={() => handleView(quote, 'quotation')}
                          title="View PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiDownload}
                          onClick={() => handleExportPDF(quote._id, 'quotation')}
                          title="Download PDF"
                        />
                        <Button variant="outline" size="small" icon={FiTrash2} onClick={() => handleDelete(quote._id, 'quotation')}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 py-8">
                      No quotations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(invoice => {
                  const matchDate = !billingFilters.date || new Date(invoice.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                  const docId = invoice.invoiceNumber || '';
                  const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                  const bookingRef = invoice.lead?.booking?.bookingNumber || invoice.lead?.leadNumber || '';
                  const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                  
                  return matchDate && matchDocId && matchBookingId;
                }).length > 0 ? (
                  invoices.filter(invoice => {
                    const matchDate = !billingFilters.date || new Date(invoice.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                    const docId = invoice.invoiceNumber || '';
                    const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                    const bookingRef = invoice.lead?.booking?.bookingNumber || invoice.lead?.leadNumber || '';
                    const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                    
                    return matchDate && matchDocId && matchBookingId;
                  }).map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="font-mono text-gold-500">{invoice.invoiceNumber}</td>
                      <td className="text-gray-400 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-gray-300">
                        {invoice.lead?.booking?.bookingNumber || invoice.lead?.leadNumber || '-'}
                      </td>
                      <td className="font-medium text-gray-100">{invoice.customerName}</td>
                      <td className="font-semibold">${(invoice.finalAmount || 0).toLocaleString()}</td>
                      <td className="text-green-400">${(invoice.paidAmount || 0).toLocaleString()}</td>
                      <td className="font-semibold text-red-500">${(invoice.balance || 0).toLocaleString()}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                          {invoice.status === 'Overdue' && <span className="text-[10px] text-red-400 font-bold uppercase">Overdue</span>}
                        </div>
                      </td>
                      <td className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiEye}
                          onClick={() => handleView(invoice, 'invoice')}
                          title="View PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiBell}
                          onClick={() => handleSendReminder(invoice)}
                          title="Send Reminder"
                          className="text-gold-500 border-gold-500 hover:bg-gold-500/10"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiDownload}
                          onClick={() => handleExportPDF(invoice._id, 'invoice')}
                          title="Download PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiTrash2}
                          onClick={() => handleDelete(invoice._id, 'invoice')}
                          title="Delete"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 py-8">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Date</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.filter(receipt => {
                  const matchDate = !billingFilters.date || new Date(receipt.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                  const docId = receipt.receiptNumber || '';
                  const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                  const bookingRef = receipt.lead?.booking?.bookingNumber || receipt.lead?.leadNumber || '';
                  const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                  
                  return matchDate && matchDocId && matchBookingId;
                }).length > 0 ? (
                  receipts.filter(receipt => {
                    const matchDate = !billingFilters.date || new Date(receipt.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                    const docId = receipt.receiptNumber || '';
                    const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                    const bookingRef = receipt.lead?.booking?.bookingNumber || receipt.lead?.leadNumber || '';
                    const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                    
                    return matchDate && matchDocId && matchBookingId;
                  }).map((receipt) => (
                    <tr key={receipt._id}>
                      <td className="font-mono text-gold-500">{receipt.receiptNumber}</td>
                      <td className="text-gray-400 text-sm">
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-gray-300">
                        {receipt.lead?.booking?.bookingNumber || receipt.lead?.leadNumber || '-'}
                      </td>
                      <td className="font-medium text-gray-100">{receipt.customerName}</td>
                      <td className="font-semibold">${(receipt.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(receipt.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(receipt.finalAmount || 0).toLocaleString()}</td>
                      <td>{receipt.paymentMethod || 'Cash'}</td>
                      <td className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiEye}
                          onClick={() => handleView(receipt, 'receipt')}
                          title="View PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiDownload}
                          onClick={() => handleExportPDF(receipt._id, 'receipt')}
                          title="Download PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiTrash2}
                          onClick={() => handleDelete(receipt._id, 'receipt')}
                          title="Delete"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 py-8">
                      No receipts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="font-mono text-gold-500">{payment.paymentId}</td>
                      <td>{payment.invoice?.invoiceNumber}</td>
                      <td className="font-medium text-gray-100">{payment.customerName}</td>
                      <td className="font-semibold text-green-400">${payment.amount?.toLocaleString()}</td>
                      <td>{payment.method}</td>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge-green">Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-400 py-8">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-luxury-light to-transparent border border-gold-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FiBell className="w-10 h-10 text-gold-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Automation Settings</h3>
                  <p className="text-gray-400">Manage automatic schedules and templates</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                onClick={() => window.location.href='/payment-reminders'}
                icon={FiPlus}
              >
                Configure Schedules
              </Button>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-medium text-gray-200">Recent Reminder Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-luxury">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {reminderHistory.length > 0 ? (
                    reminderHistory.map((log) => (
                      <tr key={log._id}>
                        <td className="text-gray-400 text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className="px-2 py-1 rounded bg-gold-500/20 text-gold-400 text-xs font-medium uppercase">
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-gray-100 text-sm">{log.description}</td>
                        <td>
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Sent
                          </span>
                        </td>
                        <td className="text-gold-500 text-sm font-medium">{log.user?.name || 'System'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-400 py-12">
                        <FiBell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No reminder history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${modalType === 'invoice' ? 'Create Invoice' : 'Record Payment'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === 'invoice' ? (
            <>
              <Input
                label="Customer Name"
                value={formData.customerName || ''}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                required
              />
              <Input
                label="Invoice Amount"
                type="number"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                required
              />
            </>
          ) : (
            <>
              <Input
                label="Payment Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <select
                  className="input-luxury w-full"
                  value={formData.method || ''}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Submit
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Generate Report">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <select
              className="input-luxury w-full"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="quotation">Quotations</option>
              <option value="invoice">Invoices</option>
              <option value="receipt">Receipts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
            <select
              className="input-luxury w-full"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleDownloadReport} variant="primary" className="flex-1" icon={FiDownload}>
              Download PDF
            </Button>
            <Button onClick={() => setShowReportModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reminder Preview Modal */}
      <Modal 
        isOpen={showReminderDraftModal} 
        onClose={() => setShowReminderDraftModal(false)} 
        title="Send Payment Reminder"
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

export default Billing;