import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiMail, FiDollarSign, FiDownload, FiTrash2, FiPrinter, FiEye } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { billingApi} from '../api/billingApi';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('quotations');
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [reportType, setReportType] = useState('quotation');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [showReportModal, setShowReportModal] = useState(false);
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

  const tabs = [
    { id: 'quotations', label: 'Quotations' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'receipts', label: 'Receipts' },
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
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
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
                      <td className="font-semibold">${(invoice.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(invoice.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(invoice.finalAmount || 0).toLocaleString()}</td>
                      <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
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
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Payment reminder system</p>
            <Button variant="primary" icon={FiPlus}>
              Setup Reminder
            </Button>
          </div>
        </Card>
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
    </div>
  );
};

export default Billing;