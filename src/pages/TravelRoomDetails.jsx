import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const TravelRoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    mealPlan: '',
  });

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await roomApi.getRoomById(roomId);
      const data = res.data?.data;
      setRoom(data);
      setCurrentImageIndex(0);
    } catch (err) {
      console.error('Failed to fetch room', err);
    }
  };

  const handleBookNow = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates before booking.');
      return;
    }

    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);

    if (end <= start) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Frontend validation for availability calendar
    if (room.availabilityCalendar && room.availabilityCalendar.length > 0) {
      const isWithinCalendar = room.availabilityCalendar.some(range => {
        return start >= new Date(range.startDate) && end <= new Date(range.endDate);
      });

      if (!isWithinCalendar) {
        toast.error('The selected dates are outside the room\'s availability calendar.');
        return;
      }
    } else {
      toast.error('This room has no availability set yet.');
      return;
    }

    // NEW: Check overlaps with existing bookings
    if (room.bookedDates && room.bookedDates.length > 0) {
      const start = new Date(bookingData.checkIn);
      const end = new Date(bookingData.checkOut);
      
      const isOverlapping = room.bookedDates.some(b => {
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        return start < bEnd && end > bStart;
      });

      if (isOverlapping) {
        toast.error('The selected dates overlap with an existing booking. Please check Locked Dates.');
        return;
      }
    }

    navigate(`/travel/booking/${roomId}`, { state: bookingData });
  };

  const nextImage = () => {
    if (room?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  if (!room) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gold-600"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-semibold mt-2 text-gray-900">
          {room.roomName}
        </h1>
        <p className="text-gray-500">{room.resort?.resortName}</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="relative">
              <img
                src={room.images?.[currentImageIndex] || ''}
                alt="Room"
                className="w-full h-[420px] object-cover rounded-lg"
              />

              {/* Carousel Controls */}
              {room.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {room.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === i ? 'bg-gold-500 w-8' : 'bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {room.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {room.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-20 w-28 object-cover rounded cursor-pointer border flex-shrink-0
                      ${currentImageIndex === i ? 'border-gold-500 ring-2 ring-gold-300' : 'border-gray-200'}`}
                    alt=""
                  />
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 text-gold-600">
              About This Room
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {room.description || 'No description available.'}
            </p>
          </div>

          {/* Room Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gold-600">
              Room Details
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Room Size</p>
                <p className="font-medium">{room.size || 0} m²</p>
              </div>

              <div>
                <p className="text-gray-500">Bed Type</p>
                <p className="font-medium">{room.bedType}</p>
              </div>

              <div>
                <p className="text-gray-500">Occupancy</p>
                <p className="font-medium">
                  {room.maxAdults} Adults, {room.maxChildren} Children
                </p>
              </div>
            </div>

            {room.amenities?.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full border border-gold-400 text-gold-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transportation */}
          {room.transportations?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-2 text-gold-600">
                Transportation
              </h2>

              <ul className="text-gray-600 list-disc ml-5">
                {room.transportations.map((t, i) => (
                  <li key={i}>
                    {t.type} – {t.method}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
{/* RIGHT BOOKING CARD */}
<div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 h-fit sticky top-24 border border-gray-100">
  <h2 className="text-xl font-semibold text-gray-900 mb-1">
    Book This Room
  </h2>

  {/* Availability Dates Display */}
  {room.availabilityCalendar && room.availabilityCalendar.length > 0 && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">Available Booking Dates:</h3>
      </div>
      <div className="space-y-1">
        {room.availabilityCalendar.map((a, i) => (
          <p key={i} className="text-xs text-blue-700">
             {new Date(a.startDate).toLocaleDateString()} to {new Date(a.endDate).toLocaleDateString()}
          </p>
        ))}
      </div>
    </div>
  )}

  {/* Booked Dates Display */}
  {room.bookedDates && room.bookedDates.length > 0 && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-red-600" />
        <h3 className="text-sm font-semibold text-red-900">Already Booked Dates (Locked):</h3>
      </div>
      <div className="space-y-1">
        {room.bookedDates.map((b, i) => (
          <p key={i} className="text-xs text-red-700 font-medium">
             ❌ {new Date(b.start).toLocaleDateString()} to {new Date(b.end).toLocaleDateString()}
          </p>
        ))}
      </div>
      <p className="text-[10px] text-red-500 mt-2 italic">* Please select dates that do not overlap with these ranges.</p>
    </div>
  )}

  <p className="text-sm text-gray-500 mb-6">
    Select your dates and preferences
  </p>

  <div className="space-y-5">
    {/* Check-in */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Check-in Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
        value={bookingData.checkIn}
        min={new Date().toISOString().split('T')[0]}
        onChange={e =>
          setBookingData({ ...bookingData, checkIn: e.target.value })
        }
      />
      {bookingData.checkIn && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Check-in: {new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
          })}
        </p>
      )}
    </div>

    {/* Check-out */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Check-out Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
        value={bookingData.checkOut}
        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
        onChange={e =>
          setBookingData({ ...bookingData, checkOut: e.target.value })
        }
      />
      {bookingData.checkOut && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Check-out: {new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
          })}
        </p>
      )}
    </div>

    {/* Meal Plan */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Meal Plan
      </label>
      <select
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
        value={bookingData.mealPlan}
        onChange={e =>
          setBookingData({ ...bookingData, mealPlan: e.target.value })
        }
      >
        <option value="">Select Meal Plan</option>
        <option>All Inclusive</option>
        <option>Full Board</option>
        <option>Half Board</option>
        <option>Bed & Breakfast</option>
      </select>
      {bookingData.mealPlan && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Selected: {bookingData.mealPlan}
        </p>
      )}
    </div>

    {/* Summary */}
    {(bookingData.checkIn || bookingData.checkOut || bookingData.mealPlan) && (
      <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mt-4">
        <h3 className="text-sm font-semibold text-gold-900 mb-2">Booking Summary</h3>
        <div className="space-y-1 text-xs text-gray-700">
          {bookingData.checkIn && bookingData.checkOut && (
            <p>
              <span className="font-medium">Duration:</span>{' '}
              {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} night(s)
            </p>
          )}
          {bookingData.mealPlan && (
            <p>
              <span className="font-medium">Meal:</span> {bookingData.mealPlan}
            </p>
          )}
        </div>
      </div>
    )}

    {/* Validation Message */}
    {(!bookingData.checkIn || !bookingData.checkOut) && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-xs text-red-700 text-center">
          ⚠️ Please select check-in and check-out dates to proceed with booking
        </p>
      </div>
    )}

    {/* Action */}
    <button
      onClick={handleBookNow}
      disabled={!bookingData.checkIn || !bookingData.checkOut}
      className={`w-full mt-4 py-3 rounded-xl font-semibold tracking-wide transition ${
        !bookingData.checkIn || !bookingData.checkOut
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gold-600 hover:bg-gold-700 text-white'
      }`}
    >
      {!bookingData.checkIn || !bookingData.checkOut 
        ? 'Select Dates to Book' 
        : 'Book Now'}
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default TravelRoomDetails;
