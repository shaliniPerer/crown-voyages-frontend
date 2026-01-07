import { useState, useEffect } from 'react';
import { FiPlus, FiMail, FiFileText, FiEye, FiEdit, FiDollarSign, FiFile, FiUser, FiUsers, FiPhone, FiMapPin, FiTrash2 } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { bookingApi } from '../api/bookingApi';
import { resortApi } from '../api/resortApi';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDate, calculateNights } from '../utils/bookingUtils';


const Booking = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resorts, setResorts] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['leads', 'quotations', 'bookings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
    fetchResorts();
  }, [activeTab]);

  // Also fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (activeTab === 'leads') {
        const res = await bookingApi.getLeads();
        setLeads(res.data.data || []);
      } else if (activeTab === 'quotations') {
        const res = await bookingApi.getQuotations();
        setQuotations(res.data.data || []);
      } else {
        const res = await bookingApi.getBookings();
        setBookings(res.data.data || []);
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

  const handleOpenProfile = (lead) => {
    setSelectedLead(lead);
    setShowProfileModal(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setFormData({
      guestName: lead.guestName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      resort: lead.resort?._id || '',
      room: lead.room?._id || '',
      checkIn: lead.checkIn ? new Date(lead.checkIn).toISOString().split('T')[0] : '',
      checkOut: lead.checkOut ? new Date(lead.checkOut).toISOString().split('T')[0] : '',
      adults: lead.adults || 1,
      children: lead.children || 0,
      rooms: lead.rooms || 1,
      mealPlan: lead.mealPlan || '',
      specialRequests: lead.specialRequests || '',
      notes: lead.notes || '',
      totalAmount: lead.totalAmount || 0,
      paidAmount: lead.paidAmount || 0,
      passengerDetails: lead.passengerDetails || [],
    });
    setShowEditModal(true);
  };

  const handleOpenQuotation = (lead) => {
    setSelectedLead(lead);
    setFormData({ 
      amount: '', 
      items: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      taxRate: 0,
      discountType: 'none',
      discountValue: 0,
      notes: '',
      terms: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sendEmail: false
    });
    setShowQuotationModal(true);
  };

  const handleOpenInvoice = (lead) => {
    setSelectedLead(lead);
    setFormData({ 
      amount: '', 
      items: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      taxRate: 0,
      discountType: 'none',
      discountValue: 0,
      notes: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sendEmail: false
    });
    setShowInvoiceModal(true);
  };

  const handleOpenReceipt = (lead) => {
    setSelectedLead(lead);
    setFormData({ 
      amount: '', 
      items: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      taxRate: 0,
      discountType: 'none',
      discountValue: 0,
      notes: '',
      paymentMethod: 'Cash',
      sendEmail: false
    });
    setShowReceiptModal(true);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings before sending
      const cleanData = { ...formData };
      if (cleanData.resort === '') delete cleanData.resort;
      if (cleanData.room === '') delete cleanData.room;
      
      // Ensure payment fields are numbers
      if (cleanData.totalAmount !== undefined) {
        cleanData.totalAmount = parseFloat(cleanData.totalAmount) || 0;
      }
      if (cleanData.paidAmount !== undefined) {
        cleanData.paidAmount = parseFloat(cleanData.paidAmount) || 0;
      }
      
      console.log('Submitting edit with data:', cleanData);
      
      await bookingApi.updateLead(selectedLead._id, cleanData);
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (window.confirm(`Are you sure you want to delete lead for ${leadName}? This action cannot be undone.`)) {
      try {
        await bookingApi.deleteLead(leadId);
        toast.success('Lead deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteBooking = async (bookingId, bookingNumber) => {
    if (window.confirm(`Are you sure you want to delete booking ${bookingNumber}? This action cannot be undone.`)) {
      try {
        await bookingApi.deleteBooking(bookingId);
        toast.success('Booking deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalAmount = (formData.amount || 0) - (formData.discountValue || 0);

      const quotationData = {
        customerName: selectedLead.guestName,
        email: selectedLead.email,
        phone: selectedLead.phone,
        amount: formData.amount || 0,
        discountValue: formData.discountValue || 0,
        finalAmount,
        validUntil: formData.validUntil,
        notes: formData.notes,
        terms: formData.terms,
        lead: selectedLead._id,
        sendEmail: formData.sendEmail || false,
      };
      
      await bookingApi.createQuotation(quotationData);
      
      if (formData.sendEmail) {
        toast.success('Quotation created and email sent successfully!');
      } else {
        toast.success('Quotation created successfully');
      }
      
      setShowQuotationModal(false);
      fetchData();
    } catch (error) {
      console.error('Quotation error:', error);
      toast.error(error.response?.data?.message || 'Quotation creation failed');
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalAmount = (formData.amount || 0) - (formData.discountValue || 0);

      const invoiceData = {
        customerName: selectedLead.guestName,
        email: selectedLead.email,
        phone: selectedLead.phone,
        amount: formData.amount || 0,
        discountValue: formData.discountValue || 0,
        finalAmount,
        dueDate: formData.dueDate,
        notes: formData.notes,
        lead: selectedLead._id,
      };
      const response = await bookingApi.createInvoice(invoiceData);
      toast.success('Invoice created successfully');
      setShowInvoiceModal(false);
      setFormData({});
      fetchData();
      // Send email if checked
      if (formData.sendEmail) {
        await bookingApi.sendInvoiceEmail(response.data.data._id);
        toast.success('Email sent successfully');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Invoice creation failed');
    }
  };

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalAmount = (formData.amount || 0) - (formData.discountValue || 0);

      const receiptData = {
        customerName: selectedLead.guestName,
        email: selectedLead.email,
        phone: selectedLead.phone,
        amount: formData.amount || 0,
        discountValue: formData.discountValue || 0,
        finalAmount,
        paymentMethod: formData.paymentMethod || 'Cash',
        notes: formData.notes,
        lead: selectedLead._id,
      };
      const response = await bookingApi.createReceipt(receiptData);
      toast.success('Receipt created successfully');
      setShowReceiptModal(false);
      setFormData({});
      fetchData();
      // Send email if checked
      if (formData.sendEmail) {
        await bookingApi.sendReceiptEmail(response.data.data._id);
        toast.success('Email sent successfully');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast.error(error.response?.data?.message || 'Receipt creation failed');
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
    // { id: 'leads', label: 'Bookings' },
    // { id: 'quotations', label: 'Quotations' },
    // { id: 'bookings', label: 'Bookings' },
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
          onClick={() => {
            if (activeTab === 'leads') {
              navigate('/travel'); 
            } else {
              handleOpenModal('quotation'); 
            }
          }}
        >
          Create {activeTab === 'leads' ? 'Booking' : 'Quotation'}
        </Button>

      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-luxury-light p-1 rounded-lg border border-gold-800/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
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
                      <td className="font-medium text-gray-100">{lead.guestName}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td>
                        <span className={`badge-${
                          lead.status === 'New' ? 'blue' :
                          lead.status === 'Quotation' ? 'purple' :
                          lead.status === 'Invoice' ? 'pink' :
                          lead.status === 'Receipt' ? 'green' :
                          lead.status === 'Confirmed' ? 'green' :
                          lead.status === 'Cancelled' ? 'red' :
                          'gold'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 items-center">
                          <button 
                            onClick={() => handleOpenProfile(lead)}
                            className="p-1.5 hover:bg-gold-500/10 rounded transition-colors text-gray-400 hover:text-gold-500"
                            title="View Profile"
                          >
                            <FiEye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 hover:bg-gold-500/10 rounded transition-colors text-gray-400 hover:text-gold-500"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenQuotation(lead)}
                            className="p-1.5 hover:bg-gold-500/10 rounded transition-colors text-gray-400 hover:text-gold-500"
                            title="Create Quotation"
                          >
                            <FiFileText size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenInvoice(lead)}
                            className="p-1.5 hover:bg-gold-500/10 rounded transition-colors text-gray-400 hover:text-gold-500"
                            title="Create Invoice"
                          >
                            <FiDollarSign size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenReceipt(lead)}
                            className="p-1.5 hover:bg-gold-500/10 rounded transition-colors text-gray-400 hover:text-gold-500"
                            title="Create Receipt"
                          >
                            <FiFile size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead._id, lead.guestName)}
                            className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-500"
                            title="Delete Lead"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
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

      {/* {activeTab === 'quotations' && (
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
                        <span className={`badge-${quote.status === 'Accepted' ? 'green' :
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
      )} */}

      {/* {activeTab === 'bookings' && (
        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking._id} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hotel Information</h3>
                      <div className="flex space-x-4">
                        <img
                          src={booking.resort?.images?.[0] || "/placeholder.svg"}
                          alt={booking.resort?.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{booking.resort?.name}</h4>
                          <p className="text-sm text-gray-600">{booking.resort?.location}</p>
                          <div className="flex items-center mt-2">
                            <div className="flex text-yellow-400">
                              {[...Array(booking.resort?.starRating || 5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{booking.resort?.starRating} Star</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID</span>
                          <span className="font-medium text-gold-500">{booking.bookingNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in</span>
                          <span className="font-medium text-gray-900">{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out</span>
                          <span className="font-medium text-gray-900">{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium text-gray-900">
                            {calculateNights(booking.checkIn, booking.checkOut)} night{calculateNights(booking.checkIn, booking.checkOut) !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Guests</span>
                          <span className="font-medium text-gray-900">
                            {booking.adults} Adults, {booking.children} Children
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rooms</span>
                          <span className="font-medium text-gray-900">
                            {booking.rooms} Room{booking.rooms !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Type</span>
                          <span className="font-medium text-gray-900">{booking.room?.roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Meal Plan</span>
                          <span className="font-medium text-gray-900">
                            {booking.mealPlan || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`badge-${booking.status === 'Confirmed' ? 'green' :
                              booking.status === 'Cancelled' ? 'red' : 'gold'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name</span>
                          <span className="font-medium text-gray-900">{booking.guestName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email</span>
                          <span className="font-medium text-gray-900">{booking.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone</span>
                          <span className="font-medium text-gray-900">{booking.phone}</span>
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {booking.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>

                    {booking.passengerDetails && booking.passengerDetails.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Passenger Details</h3>
                        {booking.passengerDetails.map((roomDetail, roomIndex) => (
                          <div key={roomIndex} className="mb-6">
                            <h4 className="text-md font-medium text-gray-700 mb-3">Room {roomDetail.roomNumber}</h4>
                            
                            {roomDetail.adults && roomDetail.adults.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-600 mb-2">Adults</h5>
                                {roomDetail.adults.map((adult, adultIndex) => (
                                  <div key={adultIndex} className="bg-gray-50 p-3 rounded-lg mb-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div><span className="font-medium">Name:</span> {adult.name || 'Not provided'}</div>
                                      <div><span className="font-medium">Passport:</span> {adult.passport || 'Not provided'}</div>
                                      <div><span className="font-medium">Country:</span> {adult.country || 'Not provided'}</div>
                                      <div><span className="font-medium">Arrival Flight:</span> {adult.arrivalFlightNumber || 'Not provided'}</div>
                                      <div><span className="font-medium">Arrival Time:</span> {adult.arrivalTime || 'Not provided'}</div>
                                      <div><span className="font-medium">Departure Flight:</span> {adult.departureFlightNumber || 'Not provided'}</div>
                                      <div><span className="font-medium">Departure Time:</span> {adult.departureTime || 'Not provided'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {roomDetail.children && roomDetail.children.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-2">Children</h5>
                                {roomDetail.children.map((child, childIndex) => (
                                  <div key={childIndex} className="bg-blue-50 p-3 rounded-lg mb-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div><span className="font-medium">Name:</span> {child.name || 'Not provided'}</div>
                                      <div><span className="font-medium">Age:</span> {child.age || 'Not provided'}</div>
                                      <div><span className="font-medium">Passport:</span> {child.passport || 'Not provided'}</div>
                                      <div><span className="font-medium">Country:</span> {child.country || 'Not provided'}</div>
                                      <div><span className="font-medium">Arrival Flight:</span> {child.arrivalFlightNumber || 'Not provided'}</div>
                                      <div><span className="font-medium">Arrival Time:</span> {child.arrivalTime || 'Not provided'}</div>
                                      <div><span className="font-medium">Departure Flight:</span> {child.departureFlightNumber || 'Not provided'}</div>
                                      <div><span className="font-medium">Departure Time:</span> {child.departureTime || 'Not provided'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-500/30">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID</span>
                          <span className="font-bold text-yellow-600">{booking.bookingNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`badge-${booking.status === 'Confirmed' ? 'green' :
                              booking.status === 'Cancelled' ? 'red' : 'gold'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center text-gray-400 py-8">
                No bookings found
              </div>
            </Card>
          )}
        </div>
      )} */}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Create ${modalType}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          {modalType === 'quotation' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resort</label>
                <select
                  className="input-luxury w-full"
                  value={formData.resort || ''}
                  onChange={(e) => setFormData({ ...formData, resort: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Booking Profile">
        {selectedLead && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Primary Guest Information */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FiUser className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.guestName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`text-sm font-semibold ${
                      selectedLead.status === 'Confirmed' ? 'text-green-600' :
                      selectedLead.status === 'Pending' ? 'text-yellow-600' :
                      selectedLead.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
                    }`}>{selectedLead.status}</span>
                  </div>
                </div>
              </div>
              {selectedLead.specialRequests && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">{selectedLead.specialRequests}</p>
                </div>
              )}
            </div>

            {/* All Bookings with Details */}
            {selectedLead.savedBookings && selectedLead.savedBookings.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">All Bookings ({selectedLead.savedBookings.length})</h3>
                {selectedLead.savedBookings.map((booking, bookingIdx) => (
                  <div key={bookingIdx} className="bg-white border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-purple-700">Booking {bookingIdx + 1}</h4>
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                        {booking.totalRooms || 1} Room{(booking.totalRooms || 1) > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Resort Details */}
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="text-md font-semibold text-green-800 mb-3">🏨 Resort Details</h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900 font-semibold">{booking.resortName}</span></p>
                        {booking.resortLocation && (
                          <p><span className="font-medium text-gray-700">📍 Location:</span> <span className="text-gray-900">{booking.resortLocation}</span></p>
                        )}
                        {booking.resortStarRating && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Rating:</span>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < booking.resortStarRating ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        )}
                        {booking.resortDescription && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-gray-600 text-xs bg-white p-2 rounded border border-green-100">{booking.resortDescription}</p>
                          </div>
                        )}
                        {booking.resortAmenities && booking.resortAmenities.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {booking.resortAmenities.map((amenity, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {booking.resortImages && booking.resortImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Resort Photos ({booking.resortImages.length})</p>
                            <div className="grid grid-cols-4 gap-2">
                              {booking.resortImages.slice(0, 8).map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Resort ${idx + 1}`}
                                    className="w-full h-16 object-cover rounded border border-green-300 hover:border-green-500 transition-all cursor-pointer"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                  {idx === 7 && booking.resortImages.length > 8 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-xs font-bold">
                                      +{booking.resortImages.length - 8}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-md font-semibold text-blue-800 mb-3">🛏️ Room Details</h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900 font-semibold">{booking.roomName}</span></p>
                        {booking.roomType && (
                          <p><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-900">{booking.roomType}</span></p>
                        )}
                        <p><span className="font-medium text-gray-700">Total Rooms Booked:</span> <span className="text-gray-900">{booking.totalRooms || 1}</span></p>
                        {booking.roomSize && (
                          <p><span className="font-medium text-gray-700">📏 Size:</span> <span className="text-gray-900">{booking.roomSize} sq m</span></p>
                        )}
                        {booking.roomBedType && (
                          <p><span className="font-medium text-gray-700">🛏️ Bed Type:</span> <span className="text-gray-900">{booking.roomBedType}</span></p>
                        )}
                        {(booking.roomMaxAdults || booking.roomMaxChildren) && (
                          <p><span className="font-medium text-gray-700">👥 Capacity:</span> <span className="text-gray-900">
                            Up to {booking.roomMaxAdults} Adult{booking.roomMaxAdults !== 1 ? 's' : ''}{booking.roomMaxChildren > 0 && `, ${booking.roomMaxChildren} Child${booking.roomMaxChildren !== 1 ? 'ren' : ''}`}
                          </span></p>
                        )}
                        {booking.roomDescription && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-gray-600 text-xs bg-white p-2 rounded border border-blue-100">{booking.roomDescription}</p>
                          </div>
                        )}
                        {booking.roomAmenities && booking.roomAmenities.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Room Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {booking.roomAmenities.map((amenity, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {booking.roomImages && booking.roomImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Room Photos ({booking.roomImages.length})</p>
                            <div className="grid grid-cols-4 gap-2">
                              {booking.roomImages.slice(0, 8).map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Room ${idx + 1}`}
                                    className="w-full h-16 object-cover rounded border border-blue-300 hover:border-blue-500 transition-all cursor-pointer"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                  {idx === 7 && booking.roomImages.length > 8 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-xs font-bold">
                                      +{booking.roomImages.length - 8}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stay Details */}
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="text-md font-semibold text-yellow-800 mb-3">📅 Stay Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-semibold text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-semibold text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} night(s)</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Meal Plan</p>
                          <p className="font-semibold text-gray-900">{booking.mealPlan || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Room Configurations */}
                    {booking.roomConfigs && booking.roomConfigs.length > 0 && (
                      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h5 className="text-md font-semibold text-orange-800 mb-3">👥 Guest Configuration</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {booking.roomConfigs.map((config, idx) => (
                            <div key={idx} className="bg-white rounded p-3 border border-orange-200 text-sm">
                              <p className="font-semibold text-gray-700 mb-1">Room {idx + 1}</p>
                              <p className="text-gray-600">{config.adults} Adult(s), {config.children} Child(ren)</p>
                              {config.children > 0 && config.childrenAges && config.childrenAges.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Ages: {config.childrenAges.filter(age => age !== undefined && age !== null).join(', ')}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <p className="text-sm font-semibold text-orange-800">
                            Total: {booking.totalAdults} Adult(s), {booking.totalChildren} Child(ren)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Passenger Details for This Booking */}
                    {selectedLead.passengerDetails && selectedLead.passengerDetails.filter(p => p.bookingIndex === bookingIdx).length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h5 className="text-md font-semibold text-indigo-800 mb-3">✈️ Guest Details for Booking {bookingIdx + 1}</h5>
                        <div className="space-y-4">
                          {selectedLead.passengerDetails.filter(p => p.bookingIndex === bookingIdx).map((room, roomIdx) => (
                            <div key={roomIdx} className="bg-white rounded-lg p-3 border border-indigo-200">
                              <h6 className="text-sm font-semibold text-indigo-700 mb-2">Room {room.roomNumber}</h6>

                              {/* Adults */}
                              {room.adults && room.adults.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-700 mb-2">👤 Adults ({room.adults.length})</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {room.adults.map((adult, adultIdx) => (
                                      <div key={adultIdx} className="bg-indigo-50 rounded p-2 text-xs">
                                        <p className="font-semibold text-indigo-600">Adult {adultIdx + 1}</p>
                                        <p><span className="font-medium">Name:</span> {adult.name || 'N/A'}</p>
                                        <p><span className="font-medium">Passport:</span> {adult.passport || 'N/A'}</p>
                                        <p><span className="font-medium">Country:</span> {adult.country || 'N/A'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Children */}
                              {room.children && room.children.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-2">👶 Children ({room.children.length})</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {room.children.map((child, childIdx) => (
                                      <div key={childIdx} className="bg-blue-50 rounded p-2 text-xs">
                                        <p className="font-semibold text-blue-600">Child {childIdx + 1}</p>
                                        <p><span className="font-medium">Name:</span> {child.name || 'N/A'}</p>
                                        <p><span className="font-medium">Age:</span> {child.age !== undefined && child.age !== null ? child.age : 'N/A'}</p>
                                        <p><span className="font-medium">Passport:</span> {child.passport || 'N/A'}</p>
                                        <p><span className="font-medium">Country:</span> {child.country || 'N/A'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Booking Details">
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primary Guest Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <FiUser className="mr-2" /> Primary Guest Information
            </h4>
            <div className="space-y-3">
              <Input
                label="Guest Name"
                value={formData.guestName || ''}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* All Bookings with Complete Details (Read-Only Display) */}
          {selectedLead?.savedBookings && selectedLead.savedBookings.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800">All Bookings ({selectedLead.savedBookings.length})</h4>
              {selectedLead.savedBookings.map((booking, bookingIdx) => (
                <div key={bookingIdx} className="bg-white border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-sm font-bold text-purple-700">Booking {bookingIdx + 1}</h5>
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                      {booking.totalRooms || 1} Room{(booking.totalRooms || 1) > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Resort Details */}
                  <div className="mb-3 bg-green-50 border border-green-200 rounded p-3">
                    <h6 className="text-xs font-semibold text-green-800 mb-2">🏨 Resort Details</h6>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Name:</span> {booking.resortName}</p>
                      {booking.resortLocation && <p><span className="font-medium">Location:</span> {booking.resortLocation}</p>}
                      {booking.resortStarRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Rating:</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < booking.resortStarRating ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      )}
                      {booking.resortImages && booking.resortImages.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs mb-1">Photos ({booking.resortImages.length})</p>
                          <div className="grid grid-cols-4 gap-1">
                            {booking.resortImages.slice(0, 4).map((img, idx) => (
                              <img key={idx} src={img} alt={`Resort ${idx + 1}`} className="w-full h-10 object-cover rounded cursor-pointer" onClick={() => window.open(img, '_blank')} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <h6 className="text-xs font-semibold text-blue-800 mb-2">🛏️ Room Details</h6>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Name:</span> {booking.roomName}</p>
                      {booking.roomType && <p><span className="font-medium">Type:</span> {booking.roomType}</p>}
                      {booking.roomSize && <p><span className="font-medium">Size:</span> {booking.roomSize} sq m</p>}
                      {booking.roomBedType && <p><span className="font-medium">Bed:</span> {booking.roomBedType}</p>}
                      {booking.roomImages && booking.roomImages.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs mb-1">Photos ({booking.roomImages.length})</p>
                          <div className="grid grid-cols-4 gap-1">
                            {booking.roomImages.slice(0, 4).map((img, idx) => (
                              <img key={idx} src={img} alt={`Room ${idx + 1}`} className="w-full h-10 object-cover rounded cursor-pointer" onClick={() => window.open(img, '_blank')} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stay & Guest Details */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                    <p><span className="font-medium">Dates:</span> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                    <p><span className="font-medium">Meal:</span> {booking.mealPlan}</p>
                    <p><span className="font-medium">Guests:</span> {booking.totalAdults} Adult(s), {booking.totalChildren} Child(ren)</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Property & Stay Details - Editable */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Property & Stay Details</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <Input
                    type="date"
                    value={formData.checkIn || ''}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                  <Input
                    type="date"
                    value={formData.checkOut || ''}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Plan</label>
                <select
                  className="input-luxury w-full"
                  value={formData.mealPlan || ''}
                  onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                >
                  <option value="">Select Meal Plan</option>
                  <option value="All-Inclusive">All-Inclusive</option>
                  <option value="Full Board">Full Board</option>
                  <option value="Half Board">Half Board</option>
                  <option value="Bed & Breakfast">Bed & Breakfast</option>
                  <option value="Room Only">Room Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guest Configuration - Editable */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Guest Configuration</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rooms || 1}
                  onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.adults || 1}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.children || 0}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Passenger Details - Editable for all rooms */}
          {selectedLead?.passengerDetails && selectedLead.passengerDetails.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                <FiUsers className="mr-2" /> All Passengers Information (Editable)
              </h4>
              {selectedLead.passengerDetails.map((room, roomIdx) => (
                <div key={roomIdx} className="mb-4 bg-white p-4 rounded-lg border border-purple-200">
                  <h5 className="text-sm font-bold text-purple-700 mb-3">Room {room.roomNumber} Passengers</h5>
                  
                  {/* Adults */}
                  {room.adults && room.adults.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-xs font-semibold text-gray-700 mb-2">Adults ({room.adults.length})</h6>
                      {room.adults.map((adult, adultIdx) => (
                        <div key={adultIdx} className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-semibold text-blue-800 mb-2">Adult {adultIdx + 1}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Full Name"
                              value={adult.name || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].adults[adultIdx].name = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Passport Number"
                              value={adult.passport || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].adults[adultIdx].passport = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Country"
                              value={adult.country || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].adults[adultIdx].country = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Flight Number"
                              value={adult.flightNumber || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].adults[adultIdx].flightNumber = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Children */}
                  {room.children && room.children.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-xs font-semibold text-gray-700 mb-2">Children ({room.children.length})</h6>
                      {room.children.map((child, childIdx) => (
                        <div key={childIdx} className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-xs font-semibold text-green-800 mb-2">Child {childIdx + 1}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Full Name"
                              value={child.name || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].children[childIdx].name = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Age"
                              type="number"
                              value={child.age || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].children[childIdx].age = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Passport Number"
                              value={child.passport || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].children[childIdx].passport = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                            <Input
                              label="Country"
                              value={child.country || ''}
                              onChange={(e) => {
                                const newPassengerDetails = [...formData.passengerDetails];
                                newPassengerDetails[roomIdx].children[childIdx].country = e.target.value;
                                setFormData({ ...formData, passengerDetails: newPassengerDetails });
                              }}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Payment Details - Editable */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Payment Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount || 0}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paidAmount || 0}
                  onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-green-200">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Balance:</span> 
                <span className="font-bold text-red-600 ml-2">
                  ${((formData.totalAmount || 0) - (formData.paidAmount || 0)).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Special Requests & Notes */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  className="input-luxury w-full"
                  rows="2"
                  value={formData.specialRequests || ''}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any special requests (dietary requirements, room preferences, etc.)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                <textarea
                  className="input-luxury w-full"
                  rows="2"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes (not visible to customer)"
                />
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Booking Status</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  className="input-luxury w-full"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="input-luxury w-full"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="New">New</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Checked-out">Checked-out</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-show">No-show</option>
                </select>
              </div>
            </div>
          </div>

          {/* Passenger Details Note */}
          {formData.passengerDetails && formData.passengerDetails.length > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <span className="mr-2">ℹ️</span> Passenger Details
              </h4>
              <p className="text-sm text-purple-700">
                This booking has {formData.passengerDetails.length} room(s) with passenger details recorded. 
                To edit passenger information, please contact the customer directly.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 mt-4">
            <Button type="submit" variant="primary" className="flex-1">
              💾 Update Booking
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quotation Modal */}
      <Modal isOpen={showQuotationModal} onClose={() => setShowQuotationModal(false)} title="Create Quotation">
        <form onSubmit={handleQuotationSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
            <h4 className="font-semibold text-gold-600 mb-3">Customer & Booking Details</h4>
            <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedLead?.guestName}</p>
            <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedLead?.email}</p>
            <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedLead?.phone}</p>
            {selectedLead?.resort && (
              <p className="text-gray-900"><span className="font-medium">Resort:</span> {selectedLead.resort.name || 'N/A'}</p>
            )}
            {selectedLead?.room && (
              <p className="text-gray-900"><span className="font-medium">Room:</span> {selectedLead.room.roomType || 'N/A'}</p>
            )}
            <p className="text-gray-900"><span className="font-medium">Check-in:</span> {selectedLead?.checkIn ? new Date(selectedLead.checkIn).toLocaleDateString() : 'N/A'}</p>
            <p className="text-gray-900"><span className="font-medium">Check-out:</span> {selectedLead?.checkOut ? new Date(selectedLead.checkOut).toLocaleDateString() : 'N/A'}</p>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valid Until</label>
            <Input
              type="date"
              value={formData.validUntil || ''}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          {/* Price Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gold-600 mb-3">Quotation Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Base Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter base price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discount Amount</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue || 0}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter discount amount"
              />
            </div>

            {/* Summary */}
            <div className="bg-white p-3 rounded-lg space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Base Price:</span>
                <span className="text-gold-500 font-bold">${(formData.amount || 0).toFixed(2)}</span>
              </div>
              {formData.discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount:</span>
                  <span>-${(formData.discountValue || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Final Price:</span>
                <span className="text-gold-500">${((formData.amount || 0) - (formData.discountValue || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                className="input-luxury w-full"
                rows="2"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions</label>
              <textarea
                className="input-luxury w-full"
                rows="2"
                value={formData.terms || ''}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Terms and conditions..."
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendQuotationEmail"
              checked={formData.sendEmail || false}
              onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="sendQuotationEmail" className="text-sm">Send quotation email to customer</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Create Quotation
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowQuotationModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Create Invoice">
        <form onSubmit={handleInvoiceSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
            <h4 className="font-semibold text-gold-600 mb-3">Customer & Booking Details</h4>
            <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedLead?.guestName}</p>
            <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedLead?.email}</p>
            <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedLead?.phone}</p>
            {selectedLead?.resort && (
              <p className="text-gray-900"><span className="font-medium">Resort:</span> {selectedLead.resort.name || 'N/A'}</p>
            )}
            {selectedLead?.room && (
              <p className="text-gray-900"><span className="font-medium">Room:</span> {selectedLead.room.roomType || 'N/A'}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Price Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gold-600 mb-3">Invoice Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Base Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter base price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discount Amount</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue || 0}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter discount amount"
              />
            </div>

            {/* Summary */}
            <div className="bg-white p-3 rounded-lg space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Base Price:</span>
                <span className="text-gold-500 font-bold">${(formData.amount || 0).toFixed(2)}</span>
              </div>
              {formData.discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount:</span>
                  <span>-${(formData.discountValue || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Final Price:</span>
                <span className="text-gold-500">${((formData.amount || 0) - (formData.discountValue || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              className="input-luxury w-full"
              rows="2"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendInvoiceEmail"
              checked={formData.sendEmail || false}
              onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="sendInvoiceEmail" className="text-sm">Send invoice email to customer</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Create Invoice
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowInvoiceModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Create Receipt">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
            <h4 className="font-semibold text-gold-600 mb-3">Customer & Booking Details</h4>
            <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedLead?.guestName}</p>
            <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedLead?.email}</p>
            <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedLead?.phone}</p>
            {selectedLead?.resort && (
              <p className="text-gray-900"><span className="font-medium">Resort:</span> {selectedLead.resort.name || 'N/A'}</p>
            )}
            {selectedLead?.room && (
              <p className="text-gray-900"><span className="font-medium">Room:</span> {selectedLead.room.roomType || 'N/A'}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <select
              className="input-luxury w-full"
              value={formData.paymentMethod || 'Cash'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>

          {/* Price Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gold-600 mb-3">Receipt Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Base Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter base price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discount Amount</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue || 0}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter discount amount"
              />
            </div>

            {/* Summary */}
            <div className="bg-white p-3 rounded-lg space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Base Price:</span>
                <span className="text-gold-500 font-bold">${(formData.amount || 0).toFixed(2)}</span>
              </div>
              {formData.discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount:</span>
                  <span>-${(formData.discountValue || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Final Price:</span>
                <span className="text-gold-500">${((formData.amount || 0) - (formData.discountValue || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              className="input-luxury w-full"
              rows="2"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendReceiptEmail"
              checked={formData.sendEmail || false}
              onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="sendReceiptEmail" className="text-sm">Send receipt email to customer</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1" onClick={handleReceiptSubmit}>
              Create Receipt
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowReceiptModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Booking;