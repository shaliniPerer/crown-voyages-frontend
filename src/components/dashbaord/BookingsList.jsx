import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Bookings List Component
export const BookingsList = ({ bookings = [] }) => {
  return (
    <div className="space-y-3">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking._id} className="flex items-center justify-between p-4 bg-luxury-lighter rounded-lg border border-gold-800/20 hover:border-gold-600/30 transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-black font-bold">
                {booking.guestName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium text-gray-100">{booking.guestName}</h4>
                <p className="text-sm text-gray-400">{booking.resort?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gold-500">${booking.totalAmount?.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{new Date(booking.checkIn).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 py-8">No upcoming bookings</p>
      )}
    </div>
  );
};