import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Booking Details Component
export const BookingDetails = ({ booking }) => {
  if (!booking) return null;

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Main Booking Info */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Booking #{booking.bookingNumber}</h3>
            <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-semibold ${
              booking.status === 'Confirmed' ? 'text-green-600' :
              booking.status === 'Pending' ? 'text-yellow-600' :
              booking.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
            }`}>{booking.status}</span></p>
          </div>
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full">
            {booking.rooms} Room{booking.rooms > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-800 border-b border-blue-300 pb-2">Property Details</h5>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-600">Resort:</span> <span className="text-gray-900">{booking.resort?.name || 'N/A'}</span></p>
              <p><span className="font-medium text-gray-600">Room Type:</span> <span className="text-gray-900">{booking.room?.roomType || booking.room?.roomName || 'N/A'}</span></p>
              <p><span className="font-medium text-gray-600">Number of Rooms:</span> <span className="text-gray-900">{booking.rooms}</span></p>
            </div>
          </div>

          {/* Stay Details */}
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-800 border-b border-blue-300 pb-2">Stay Details</h5>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-600">Check-in:</span> <span className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
              <p><span className="font-medium text-gray-600">Check-out:</span> <span className="text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
              <p><span className="font-medium text-gray-600">Duration:</span> <span className="text-gray-900">{calculateNights(booking.checkIn, booking.checkOut)} night{calculateNights(booking.checkIn, booking.checkOut) !== 1 ? 's' : ''}</span></p>
              <p><span className="font-medium text-gray-600">Meal Plan:</span> <span className="text-gray-900">{booking.mealPlan || 'Not selected'}</span></p>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="mt-4 pt-4 border-t border-blue-300">
          <h5 className="font-semibold text-gray-800 mb-3">Guests</h5>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{booking.adults}</span> Adult{booking.adults !== 1 ? 's' : ''}
              {booking.children > 0 && <>, <span className="font-semibold">{booking.children}</span> Child{booking.children !== 1 ? 'ren' : ''}</>}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Guest Information */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Guest Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <FiUser className="text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiMail className="text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{booking.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiPhone className="text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{booking.phone}</p>
            </div>
          </div>
        </div>
        {booking.specialRequests && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Special Requests</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.specialRequests}</p>
          </div>
        )}
      </div>

      {/* Passenger Details */}
      {booking.passengerDetails && booking.passengerDetails.length > 0 && (
        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Passengers Details</h3>
          <div className="space-y-6">
            {booking.passengerDetails.map((room, roomIdx) => (
              <div key={roomIdx} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-md font-semibold text-purple-700 mb-3">Room {room.roomNumber || roomIdx + 1}</h4>

                {/* Adults */}
                {room.adults && room.adults.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Adults ({room.adults.length})</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {room.adults.map((adult, adultIdx) => (
                        <div key={adultIdx} className="bg-white rounded p-3 border border-purple-100">
                          <p className="text-xs font-semibold text-purple-600 mb-1">Adult {adultIdx + 1}</p>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Name:</span> {adult.name || 'N/A'}</p>
                            <p><span className="font-medium">Passport:</span> {adult.passport || 'N/A'}</p>
                            <p><span className="font-medium">Country:</span> {adult.country || 'N/A'}</p>
                            {adult.arrivalFlightNumber && (
                              <p><span className="font-medium">Arrival:</span> {adult.arrivalFlightNumber} at {adult.arrivalTime}</p>
                            )}
                            {adult.departureFlightNumber && (
                              <p><span className="font-medium">Departure:</span> {adult.departureFlightNumber} at {adult.departureTime}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children */}
                {room.children && room.children.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Children ({room.children.length})</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {room.children.map((child, childIdx) => (
                        <div key={childIdx} className="bg-white rounded p-3 border border-purple-100">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Child {childIdx + 1}</p>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Name:</span> {child.name || 'N/A'}</p>
                            <p><span className="font-medium">Age:</span> {child.age || 'N/A'}</p>
                            <p><span className="font-medium">Passport:</span> {child.passport || 'N/A'}</p>
                            <p><span className="font-medium">Country:</span> {child.country || 'N/A'}</p>
                          </div>
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

      {/* Payment Details */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">${booking.totalAmount?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-600">Total Amount</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">${booking.paidAmount?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-600">Paid</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
            <p className="text-2xl font-bold text-red-600">${booking.balance?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-600">Balance</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{booking.status || 'Pending'}</p>
            <p className="text-xs text-gray-600">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};