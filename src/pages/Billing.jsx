import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiMail, FiDollarSign, FiDownload } from 'react-icons/fi';
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'quotations') {
        const res = await bookingApi.getQuotations();
        setQuotations(res.data.data || res.data || []);
      } else if (activeTab === 'invoices') {
        const res = await billingApi.getInvoices();
        setInvoices(res.data.data || res.data || []);
      } else if (activeTab === 'receipts') {
        // Fetch receipts from bookingApi
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
          <p className="text-gray-400 mt-1">Manage quotations, invoices, receipts, and payments</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'invoices' && (
            <Button variant="primary" icon={FiPlus} onClick={() => handleOpenModal('invoice')}>
              Create Invoice
            </Button>
          )}
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

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Quotation ID</th>
                  <th>Customer</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length > 0 ? (
                  quotations.map((quote) => (
                    <tr key={quote._id}>
                      <td className="font-mono text-gold-500">{quote.quotationNumber}</td>
                      <td className="font-medium text-gray-100">{quote.customerName}</td>
                      <td className="font-semibold">${(quote.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(quote.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(quote.finalAmount || 0).toLocaleString()}</td>
                      <td>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge-${quote.status === 'Accepted' ? 'green' : quote.status === 'Rejected' ? 'red' : 'gold'}`}>
                          {quote.status || 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="outline" size="small" icon={FiFileText} onClick={() => handleExportPDF(quote._id, 'quotation')}>
                            PDF
                          </Button>
                          <Button variant="outline" size="small" icon={FiMail} onClick={() => handleSendEmail(quote._id, 'quotation')}>
                            Send
                          </Button>
                        </div>
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
                  <th>Customer</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="font-mono text-gold-500">{invoice.invoiceNumber}</td>
                      <td className="font-medium text-gray-100">{invoice.customerName}</td>
                      <td className="font-semibold">${(invoice.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(invoice.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(invoice.finalAmount || 0).toLocaleString()}</td>
                      <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge-${
                          invoice.status === 'Paid' ? 'green' : 
                          invoice.status === 'Overdue' ? 'red' : 'gold'
                        }`}>
                          {invoice.status || 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="small"
                            icon={FiFileText}
                            onClick={() => handleExportPDF(invoice._id, 'invoice')}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            icon={FiMail}
                            onClick={() => handleSendEmail(invoice._id, 'invoice')}
                          >
                            Send
                          </Button>
                        </div>
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
                  <th>Customer</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length > 0 ? (
                  receipts.map((receipt) => (
                    <tr key={receipt._id}>
                      <td className="font-mono text-gold-500">{receipt.receiptNumber}</td>
                      <td className="font-medium text-gray-100">{receipt.customerName}</td>
                      <td className="font-semibold">${(receipt.amount || 0).toLocaleString()}</td>
                      <td className="text-green-600">-${(receipt.discountValue || 0).toLocaleString()}</td>
                      <td className="font-semibold text-gold-500">${(receipt.finalAmount || 0).toLocaleString()}</td>
                      <td>{receipt.paymentMethod || 'Cash'}</td>
                      <td>
                        <span className="badge-green">
                          {receipt.status || 'Received'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="small"
                            icon={FiFileText}
                            onClick={() => handleExportPDF(receipt._id, 'receipt')}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            icon={FiMail}
                            onClick={() => handleSendEmail(receipt._id, 'receipt')}
                          >
                            Send
                          </Button>
                        </div>
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
    </div>
  );
};

export default Billing;