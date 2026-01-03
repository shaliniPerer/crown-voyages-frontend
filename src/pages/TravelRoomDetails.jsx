import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '../api/roomApi';

const TravelRoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    mealPlan: '',
    adults: 1,
    children: 0,
  });

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await roomApi.getRoomById(roomId);
      const data = res.data?.data;
      setRoom(data);
      setSelectedImage(data?.images?.[0] || '');
    } catch (err) {
      console.error('Failed to fetch room', err);
    }
  };

  const handleBookNow = () => {
    navigate(`/travel/booking/${roomId}`, { state: bookingData });
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
          {/* Image Gallery */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <img
              src={selectedImage}
              alt="Room"
              className="w-full h-[420px] object-cover rounded-lg"
            />

            {room.images?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {room.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 w-28 object-cover rounded cursor-pointer border
                      ${selectedImage === img ? 'border-gold-500' : 'border-gray-200'}`}
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
  <p className="text-sm text-gray-500 mb-6">
    Select your dates and preferences
  </p>

  <div className="space-y-5">
    {/* Check-in */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Check-in Date
      </label>
      <input
        type="date"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
        value={bookingData.checkIn}
        onChange={e =>
          setBookingData({ ...bookingData, checkIn: e.target.value })
        }
      />
    </div>

    {/* Check-out */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Check-out Date
      </label>
      <input
        type="date"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
        value={bookingData.checkOut}
        onChange={e =>
          setBookingData({ ...bookingData, checkOut: e.target.value })
        }
      />
    </div>

    {/* Meal Plan */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Meal Plan
      </label>
      <select
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
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
    </div>

    {/* Guests */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Adults
        </label>
        <input
          type="number"
          min="1"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
          value={bookingData.adults}
          onChange={e =>
            setBookingData({
              ...bookingData,
              adults: Number(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Children
        </label>
        <input
          type="number"
          min="0"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
          value={bookingData.children}
          onChange={e =>
            setBookingData({
              ...bookingData,
              children: Number(e.target.value),
            })
          }
        />
      </div>
    </div>

    {/* Action */}
    <button
      onClick={handleBookNow}
      className="w-full mt-4 bg-gold-600 hover:bg-gold-700 transition text-white py-3 rounded-xl font-semibold tracking-wide"
    >
      Book Now
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default TravelRoomDetails;
