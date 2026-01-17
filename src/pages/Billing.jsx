import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiMail, FiDollarSign, FiDownload, FiTrash2, FiPrinter, FiEye, FiBell } from 'react-icons/fi';
import { HiTicket } from 'react-icons/hi';
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
  const [vouchers, setVouchers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminderConfig, setReminderConfig] = useState([]);
  const [activeReminderTab, setActiveReminderTab] = useState('manual'); // 'manual', 'automation', 'history'
  const [invoiceHistory, setInvoiceHistory] = useState([]);
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
      } else if (activeTab === 'vouchers') {
        const res = await bookingApi.getVouchers?.() || { data: [] };
        setVouchers(res.data.data || res.data || []);
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
      if (type === 'reminder') {
        setFormData({
          reminderType: 'before',
          days: 3,
          frequency: 'once',
          subject: 'Payment Reminder - Invoice {invoice_number}',
          template: DEFAULT_REMINDER_TEMPLATES.before,
          enabled: true,
        });
      } else {
        setFormData({});
      }
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
        const paymentData = {
          invoice: formData.invoice,
          amount: parseFloat(formData.amountValue || formData.amount),
          method: formData.method || 'Cash',
          notes: formData.notes
        };
        await billingApi.recordPayment(paymentData);
        toast.success('Payment recorded successfully');
      } else if (modalType === 'reminder') {
        if (formData._id) {
          await billingApi.updateReminder(formData._id, formData);
          toast.success('Reminder updated successfully');
        } else {
          await billingApi.createReminder(formData);
          toast.success('Reminder created successfully');
        }
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
      } else if (type === 'voucher') {
        // You might want to add a deleteVoucher endpoint if needed
        // For now let's assume it's just viewing/listing
        toast.info("Deletion for vouchers is currently restricted");
        return;
      } else if (type === 'reminder') {
        await billingApi.deleteReminder(id);
      }
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
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
      } else if (type === 'voucher') {
        await bookingApi.sendVoucherEmail(id);
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
      } else if (type === 'voucher') {
        response = await bookingApi.exportVoucherPDF(id);
        filename = `voucher-${id}.pdf`;
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
      } else if (type === 'voucher') {
        response = await bookingApi.exportVoucherPDF(item._id);
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

      // Fetch global configs and historical logs for this invoice
      const [remRes, historyRes] = await Promise.all([
        billingApi.getReminders(),
        billingApi.getHistory()
      ]);

      const globalReminders = remRes.data.data || remRes.data || [];
      const matchingReminder = globalReminders.find(r => r.enabled && r.reminderType === type);
      if (matchingReminder) {
        subject = matchingReminder.subject;
        template = matchingReminder.template;
      }

      const allLogs = historyRes.data.data || historyRes.data || [];
      const invoiceSpecificLogs = allLogs.filter(log => 
        log.resourceId === invoice._id || 
        log.description?.includes(invoice.invoiceNumber)
      );

      setReminderConfig(globalReminders);
      setInvoiceHistory(invoiceSpecificLogs);
      setSelectedInvoice(invoice);
      setActiveReminderTab('manual');
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

  const handleUpdateInvoiceReminders = async (enabled) => {
    try {
      await billingApi.updateInvoice(selectedInvoice._id, { remindersEnabled: enabled });
      setSelectedInvoice({ ...selectedInvoice, remindersEnabled: enabled });
      toast.success(`Automated reminders ${enabled ? 'enabled' : 'disabled'} for this invoice`);
      fetchData(); // Refresh list to keep state in sync
    } catch (error) {
      toast.error('Failed to update automation settings');
    }
  };

  const tabs = [
    { id: 'quotations', label: 'Quotations' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'vouchers', label: 'Vouchers' },
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
          {/* <Button variant="outline" icon={FiBell} onClick={() => window.location.href='/payment-reminders'} title="Configure Automated Schedules">
            Reminders
          </Button> */}
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
                  <th>Invoice Amt</th>
                  <th>Booking Total</th>
                  <th>Total Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
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
                      <td className="font-mono text-gold-500">
                        {invoice.invoiceNumber}
                        {invoice.dueDate && (
                          <div className="text-[10px] text-gray-500 mt-1 uppercase">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="text-gray-400 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-gray-300">
                        {invoice.lead?.booking?.bookingNumber || invoice.lead?.leadNumber || '-'}
                      </td>
                      <td className="font-medium text-gray-100">{invoice.customerName}</td>
                      <td className="font-semibold">${(invoice.finalAmount || 0).toLocaleString()}</td>
                      <td className="text-gray-400 text-xs italic">${(invoice.lead?.totalAmount || invoice.finalAmount || 0).toLocaleString()}</td>
                      <td className="text-green-400 font-bold">${(invoice.paidAmount || 0).toLocaleString()}</td>
                      <td className="font-semibold text-red-500">${(invoice.balance || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge-${invoice.status === 'Paid' ? 'green' : invoice.status === 'Partial' ? 'gold' : 'red'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="flex gap-2">
                        {/* <Button
                          variant="outline"
                          size="small"
                          icon={FiDollarSign}
                          onClick={() => handleOpenModal('payment', { 
                            invoice: invoice._id, 
                            amount: invoice.lead?.balance || invoice.balance, 
                            customerName: invoice.customerName 
                          })}
                          title="Record Payment"
                          className="text-green-500 border-green-500 hover:bg-green-500/10"
                          disabled={invoice.status === 'Paid'}
                        /> */}
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
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
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
                      <td className="font-semibold text-gray-400">${(receipt.bookingTotal || receipt.lead?.totalAmount || receipt.invoice?.finalAmount || 0).toLocaleString()}</td>
                      <td className="font-bold text-green-400">${(receipt.lead?.paidAmount || receipt.invoice?.paidAmount || 0).toLocaleString()}</td>
                      <td className="font-semibold text-red-500">${(receipt.remainingBalance !== undefined && receipt.remainingBalance !== null ? receipt.remainingBalance : (receipt.lead?.balance || receipt.invoice?.balance || 0)).toLocaleString()}</td>
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
                onClick={() => handleOpenModal('reminder')}
                icon={FiPlus}
              >
                Create Schedule
              </Button>
            </div>
          </Card>

          {/* Scheduled Reminders List */}
          {reminders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((reminder) => (
                <Card key={reminder._id} className="p-6 border-gold-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FiBell className="text-gold-500 w-5 h-5" />
                        <h3 className="text-lg font-semibold text-gray-100">{reminder.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          reminder.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {reminder.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gold-500/80">Type:</span>
                          <span className="capitalize">{reminder.reminderType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gold-500/80">Days:</span>
                          <span>{reminder.days} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gold-500/80">Frequency:</span>
                          <span className="capitalize">{reminder.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gold-500/80">Last Run:</span>
                          <span>{reminder.lastRun ? new Date(reminder.lastRun).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleToggleStatus(reminder)}
                        title={reminder.enabled ? 'Disable' : 'Enable'}
                        className={reminder.enabled ? 'text-green-500 border-green-500/30' : 'text-gray-500 border-gray-500/30'}
                      >
                        {reminder.enabled ? 'On' : 'Off'}
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        icon={FiPlus}
                        onClick={() => handleOpenModal('reminder', reminder)}
                        title="Edit"
                      />
                      <Button
                        variant="outline"
                        size="small"
                        icon={FiTrash2}
                        onClick={() => handleDelete(reminder._id, 'reminder')}
                        title="Delete"
                        className="text-red-500 border-red-500/30"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

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

      {/* Vouchers Tab */}
      {activeTab === 'vouchers' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Voucher ID</th>
                  <th>Date</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Resort</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.filter(voucher => {
                  const matchDate = !billingFilters.date || new Date(voucher.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                  const docId = voucher.voucherId || '';
                  const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                  const bookingRef = voucher.lead?.booking?.bookingNumber || voucher.lead?.leadNumber || '';
                  const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                  
                  return matchDate && matchDocId && matchBookingId;
                }).length > 0 ? (
                  vouchers.filter(voucher => {
                    const matchDate = !billingFilters.date || new Date(voucher.createdAt).toLocaleDateString('en-CA') === billingFilters.date;
                    const docId = voucher.voucherId || '';
                    const matchDocId = !billingFilters.docId || docId.toLowerCase().includes(billingFilters.docId.toLowerCase());
                    const bookingRef = voucher.lead?.booking?.bookingNumber || voucher.lead?.leadNumber || '';
                    const matchBookingId = !billingFilters.bookingId || bookingRef.toLowerCase().includes(billingFilters.bookingId.toLowerCase());
                    
                    return matchDate && matchDocId && matchBookingId;
                  }).map((voucher) => (
                    <tr key={voucher._id}>
                      <td className="font-mono text-gold-500">{voucher.voucherId}</td>
                      <td className="text-gray-400 text-sm">
                        {new Date(voucher.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-gray-300">
                        {voucher.lead?.booking?.bookingNumber || voucher.lead?.leadNumber || '-'}
                      </td>
                      <td className="font-medium text-gray-100">{voucher.customerName}</td>
                      <td className="text-gray-300">{voucher.resort?.name || 'N/A'}</td>
                      <td className="text-gray-400 text-sm">{voucher.room?.name || 'N/A'}</td>
                      <td className="text-gray-400 text-sm">{new Date(voucher.checkIn).toLocaleDateString()}</td>
                      <td className="text-gray-400 text-sm">{new Date(voucher.checkOut).toLocaleDateString()}</td>
                      <td className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiEye}
                          onClick={() => handleView(voucher, 'voucher')}
                          title="View PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiDownload}
                          onClick={() => handleExportPDF(voucher._id, 'voucher')}
                          title="Download PDF"
                        />
                        <Button
                          variant="outline"
                          size="small"
                          icon={FiMail}
                          onClick={() => handleSendEmail(voucher._id, 'voucher')}
                          title="Send Email"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-gray-400 py-12">
                      <HiTicket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      No vouchers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={`${modalType === 'invoice' ? 'Create Invoice' : modalType === 'reminder' ? (formData._id ? 'Edit Reminder' : 'Create Reminder') : 'Record Payment'}`}
      >
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
                type="text"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                required
              />
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-300">Due Date</label>
                <input
                  type="date"
                  className="input-luxury w-full"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
            </>
          ) : modalType === 'reminder' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        template: DEFAULT_REMINDER_TEMPLATES[e.target.value],
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
              </div>

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
                  rows={6}
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  placeholder="Use {customer_name}, {invoice_number}, {amount}, {due_date} as placeholders"
                  required
                />
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
                  Enable this automated schedule
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800 p-4 rounded-lg border border-gold-800/30 mb-4 text-white">
                <p className="text-sm text-gray-400">Payment for</p>
                <p className="text-xl font-bold text-gold-500">{formData.customerName}</p>
                <div className="mt-2 flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Current Balance:</span>
                  <span className="text-lg font-bold text-red-500">${(formData.amount || 0).toLocaleString()}</span>
                </div>
              </div>
              <Input
                label="Payment Amount"
                type="text"
                value={formData.amountValue || formData.amount || ''}
                onChange={(e) => setFormData({...formData, amountValue: e.target.value})}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Default is remaining balance. You can pay partially.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <select
                  className="input-luxury w-full"
                  value={formData.method || 'Cash'}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              <Input
                label="Transaction ID / Notes"
                placeholder="Optional ref #..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
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
        title={`Payment Reminders - ${selectedInvoice?.invoiceNumber}`}
        maxWidth="2xl"
      >
        <div className="flex border-b border-gold-800/30 mb-4">
          <button 
            onClick={() => setActiveReminderTab('manual')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeReminderTab === 'manual' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Manual Send
          </button>
          <button 
            onClick={() => setActiveReminderTab('automation')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeReminderTab === 'automation' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Automation Settings
          </button>
          <button 
            onClick={() => setActiveReminderTab('history')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeReminderTab === 'history' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            History
          </button>
        </div>

        {activeReminderTab === 'manual' && (
          <form onSubmit={handleConfirmSendReminder} className="space-y-4">
            <div className="bg-gold-500/10 p-3 rounded-lg border border-gold-500/20 mb-4 text-xs">
              <p className="text-gold-500">
                <span className="font-bold">Recipient:</span> {selectedInvoice?.customerName} ({selectedInvoice?.email}) | 
                <span className="font-bold ml-2">Balance:</span> ${selectedInvoice?.balance?.toLocaleString()}
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
                className="input-luxury w-full text-sm"
                rows={8}
                value={reminderDraft.template}
                onChange={(e) => setReminderDraft({ ...reminderDraft, template: e.target.value })}
                placeholder="Use {customer_name}, {invoice_number}, {amount}, {due_date} as placeholders"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 text-sm py-2"
                disabled={sendingReminder}
              >
                {sendingReminder ? 'Sending...' : 'Send Manual Reminder Now'}
              </Button>
            </div>
          </form>
        )}

        {activeReminderTab === 'automation' && (
          <div className="space-y-6 py-2">
            <div className="bg-luxury-light p-4 rounded-lg border border-gold-800/30">
              <label className="block text-sm font-medium text-gold-500 mb-2 uppercase tracking-wider">
                Base Due Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input-luxury flex-1 text-sm h-10"
                  value={selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedInvoice({ ...selectedInvoice, dueDate: newDate });
                    billingApi.updateInvoice(selectedInvoice._id, { dueDate: newDate });
                    toast.success('Due date updated');
                    fetchData();
                  }}
                />
                <div className="bg-black/40 px-3 py-1 rounded border border-gold-800/20 flex flex-col justify-center min-w-[100px] text-center">
                  <span className="text-[10px] text-gray-500 uppercase">Automation</span>
                  <button
                    onClick={() => handleUpdateInvoiceReminders(!selectedInvoice?.remindersEnabled)}
                    className={`text-xs font-bold uppercase transition-colors ${selectedInvoice?.remindersEnabled ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                  >
                    {selectedInvoice?.remindersEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gold-500 uppercase tracking-widest px-1">Configured Schedules</h5>
              {reminderConfig.filter(r => r.enabled).length > 0 ? (
                reminderConfig.filter(r => r.enabled).map(rem => {
                  const invRemConfig = selectedInvoice?.reminderConfigs?.[rem.reminderType] || { days: rem.days, frequency: rem.frequency, enabled: true };
                  
                  return (
                    <div key={rem._id} className="p-4 bg-black/40 border border-gray-800 rounded-lg space-y-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
                        <span className="text-gray-200 font-semibold capitalize flex items-center gap-2">
                          <FiBell className="w-3 h-3 text-gold-500" />
                          {rem.reminderType} Due Date
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-gray-500 uppercase">Frequency</label>
                          <select 
                            className="bg-black/60 border border-gold-800/30 rounded text-[10px] text-gold-500 px-1 py-1 focus:outline-none"
                            value={invRemConfig.frequency}
                            onChange={(e) => {
                              const newConfigs = { 
                                ...(selectedInvoice.reminderConfigs || {}),
                                [rem.reminderType]: { ...invRemConfig, frequency: e.target.value } 
                              };
                              setSelectedInvoice({ ...selectedInvoice, reminderConfigs: newConfigs });
                              billingApi.updateInvoice(selectedInvoice._id, { reminderConfigs: newConfigs });
                              toast.success('Frequency updated');
                            }}
                          >
                            <option value="once">Once</option>
                            <option value="twice">Twice</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] text-gray-500 uppercase block">Send On Specfic Date</label>
                          <input
                            type="date"
                            className="input-luxury w-full text-[12px] h-8"
                            disabled={!selectedInvoice?.dueDate || rem.reminderType === 'on'}
                            value={selectedInvoice?.dueDate ? (() => {
                              const d = new Date(selectedInvoice.dueDate);
                              const days = invRemConfig.days;
                              if (rem.reminderType === 'before') d.setDate(d.getDate() - parseInt(days));
                              else if (rem.reminderType === 'after') d.setDate(d.getDate() + parseInt(days));
                              return d.toISOString().split('T')[0];
                            })() : ''}
                            onChange={(e) => {
                              const newSendDate = new Date(e.target.value);
                              const dueDate = new Date(selectedInvoice.dueDate);
                              let diffDays = 0;
                              
                              if (rem.reminderType === 'before') {
                                diffDays = Math.round((dueDate - newSendDate) / (1000 * 60 * 60 * 24));
                              } else if (rem.reminderType === 'after') {
                                diffDays = Math.round((newSendDate - dueDate) / (1000 * 60 * 60 * 24));
                              }

                              if (diffDays < 0) {
                                toast.warning(`Invalid date for ${rem.reminderType} reminder`);
                                return;
                              }

                              const newConfigs = { 
                                ...(selectedInvoice.reminderConfigs || {}),
                                [rem.reminderType]: { ...invRemConfig, days: diffDays } 
                              };
                              
                              setSelectedInvoice({ ...selectedInvoice, reminderConfigs: newConfigs });
                              billingApi.updateInvoice(selectedInvoice._id, { reminderConfigs: newConfigs });
                              toast.success('Send date updated');
                              fetchData();
                            }}
                          />
                        </div>
                        <div className="text-right min-w-[80px]">
                          <span className="text-[10px] text-gray-500 uppercase block">Relative</span>
                          <span className="text-xs text-gold-500 font-bold">
                            {invRemConfig.days} days {rem.reminderType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm italic">
                  No automated schedules are globally enabled.
                </div>
              )}
            </div>
          </div>
        )}

        {activeReminderTab === 'history' && (
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {invoiceHistory.length > 0 ? (
              <div className="space-y-3">
                {invoiceHistory.map((log) => (
                  <div key={log._id} className="p-3 bg-luxury-light rounded border border-gray-800 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gold-500 uppercase">{log.action.replace('_', ' ')}</span>
                      <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300">{log.description}</p>
                    <div className="mt-1 text-gray-500 text-[10px]">By: {log.user?.name || 'System'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiMail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No reminder history for this invoice.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;