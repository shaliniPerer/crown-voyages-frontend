import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Booking Details Component
export const BookingDetails = ({ booking }) => {
  if (!booking) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Guest Information</h3>
          <div className="space-y-2">
            <p className="text-gray-100"><span className="font-semibold">Name:</span> {booking.guestName}</p>
            <p className="text-gray-100"><span className="font-semibold">Email:</span> {booking.email}</p>
            <p className="text-gray-100"><span className="font-semibold">Phone:</span> {booking.phone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Booking Information</h3>
          <div className="space-y-2">
            <p className="text-gray-100"><span className="font-semibold">Booking ID:</span> {booking.bookingNumber}</p>
            <p className="text-gray-100"><span className="font-semibold">Resort:</span> {booking.resort?.name}</p>
            <p className="text-gray-100"><span className="font-semibold">Room:</span> {booking.room?.roomType}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Stay Details</h3>
          <div className="space-y-2">
            <p className="text-gray-100"><span className="font-semibold">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p className="text-gray-100"><span className="font-semibold">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p className="text-gray-100"><span className="font-semibold">Guests:</span> {booking.adults} Adults, {booking.children} Children</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Details</h3>
          <div className="space-y-2">
            <p className="text-gray-100"><span className="font-semibold">Total Amount:</span> <span className="text-gold-500">${booking.totalAmount?.toLocaleString()}</span></p>
            <p className="text-gray-100"><span className="font-semibold">Paid:</span> <span className="text-green-400">${booking.paidAmount?.toLocaleString()}</span></p>
            <p className="text-gray-100"><span className="font-semibold">Balance:</span> <span className="text-red-400">${booking.balance?.toLocaleString()}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};