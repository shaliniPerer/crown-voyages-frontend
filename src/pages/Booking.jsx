import { useState, useEffect } from 'react';
import { FiPlus, FiMail, FiFileText, FiEye } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { bookingApi} from '../api/bookingApi';
import {  resortApi} from '../api/resortApi';
import { toast } from 'react-toastify';

const Booking = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resorts, setResorts] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
    fetchResorts();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'leads') {
        const res = await bookingApi.getLeads();
        setLeads(res.data);
      } else if (activeTab === 'quotations') {
        const res = await bookingApi.getQuotations();
        setQuotations(res.data);
      } else {
        const res = await bookingApi.getBookings();
        setBookings(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchResorts = async () => {
    try {
      const res = await resortApi.getResorts();
      setResorts(res.data);
    } catch (error) {
      console.error('Error fetching resorts:', error);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'lead') {
        await bookingApi.createLead(formData);
        toast.success('Lead created successfully');
      } else if (modalType === 'quotation') {
        await bookingApi.createQuotation(formData);
        toast.success('Quotation created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await bookingApi.sendQuotationEmail(id);
      toast.success('Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const tabs = [
    { id: 'leads', label: 'Leads' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Booking Management</h1>
          <p className="text-gray-400 mt-1">Manage leads, quotations, and bookings</p>
        </div>
        <Button 
          variant="primary" 
          icon={FiPlus}
          onClick={() => handleOpenModal(activeTab === 'leads' ? 'lead' : 'quotation')}
        >
          Create {activeTab === 'leads' ? 'Lead' : 'Quotation'}
        </Button>
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

      {/* Content */}
      {activeTab === 'leads' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead._id}>
                      <td className="font-medium text-gray-100">{lead.customerName}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td>
                        <span className={`badge-${lead.status === 'New' ? 'blue' : 'gold'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <Button variant="outline" size="small">
                          Convert to Quotation
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 py-8">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'quotations' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Quotation ID</th>
                  <th>Customer</th>
                  <th>Resort</th>
                  <th>Amount</th>
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
                      <td>{quote.resort?.name}</td>
                      <td className="font-semibold text-gold-500">${quote.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge-${
                          quote.status === 'Accepted' ? 'green' : 
                          quote.status === 'Rejected' ? 'red' : 'gold'
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="outline" size="small" icon={FiEye}>
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="small" 
                            icon={FiMail}
                            onClick={() => handleSendEmail(quote._id)}
                          >
                            Send
                          </Button>
                          <Button variant="outline" size="small" icon={FiFileText}>
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 py-8">
                      No quotations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'bookings' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Resort</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="font-mono text-gold-500">{booking.bookingNumber}</td>
                      <td className="font-medium text-gray-100">{booking.guestName}</td>
                      <td>{booking.resort?.name}</td>
                      <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge-${
                          booking.status === 'Confirmed' ? 'green' : 
                          booking.status === 'Cancelled' ? 'red' : 'gold'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="font-semibold text-gold-500">${booking.totalAmount?.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-400 py-8">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Create ${modalType}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input
            label="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          {modalType === 'quotation' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resort</label>
                <select 
                  className="input-luxury w-full"
                  value={formData.resort || ''}
                  onChange={(e) => setFormData({...formData, resort: e.target.value})}
                  required
                >
                  <option value="">Select Resort</option>
                  {resorts.map(resort => (
                    <option key={resort._id} value={resort._id}>{resort.name}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Create
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

export default Booking;